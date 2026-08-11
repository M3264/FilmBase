package `fun`.filmbase.app

import android.app.Application
import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

sealed interface AppState {
    data object Loading : AppState
    data class Ready(val shelves: List<Shelf>) : AppState
    data class Results(val title: String, val items: List<TitleCard>) : AppState
    data class Detail(val item: TitleDetail) : AppState
    data class Failure(val message: String) : AppState
}

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = CatalogRepository()
    private val library = LibraryStore(application)
    private val _state = MutableStateFlow<AppState>(AppState.Loading)
    val state: StateFlow<AppState> = _state.asStateFlow()
    private val _saved = MutableStateFlow(library.saved().map { it.id }.toSet())
    val saved: StateFlow<Set<String>> = _saved.asStateFlow()
    private val _savedTitles = MutableStateFlow(library.saved())
    val savedItems: StateFlow<List<TitleCard>> = _savedTitles.asStateFlow()
    private val _recent = MutableStateFlow(library.recent())
    val recent: StateFlow<List<TitleCard>> = _recent.asStateFlow()
    private val _downloads = MutableStateFlow(library.downloads())
    val downloads: StateFlow<List<DownloadEntry>> = _downloads.asStateFlow()
    private val _darkTheme = MutableStateFlow(library.darkTheme())
    val darkTheme: StateFlow<Boolean> = _darkTheme.asStateFlow()
    private var previousState: AppState = AppState.Loading

    init { home() }

    fun home() = launch {
        _state.value = AppState.Loading
        _state.value = runCatching {
            val shelves = repo.home().toMutableList()
            runCatching { repo.legacyCatalog("category/nollywood/") }.getOrNull()?.takeIf { it.isNotEmpty() }?.let { shelves += Shelf("Nollywood focus", it.take(12)) }
            runCatching { repo.legacyCatalog("category/korean-drama/") }.getOrNull()?.takeIf { it.isNotEmpty() }?.let { shelves += Shelf("K-drama shelf", it.take(12)) }
            AppState.Ready(shelves)
        }.getOrElse { AppState.Failure("FilmBase could not reach the archive.") }
    }

    fun browse(kind: String, title: String) = launch {
        _state.value = AppState.Loading
        _state.value = runCatching { AppState.Results(title, repo.catalog(kind)) }.getOrElse { AppState.Failure("This shelf could not be opened.") }
    }

    fun legacyBrowse(path: String, title: String) = launch {
        _state.value = AppState.Loading
        _state.value = runCatching { AppState.Results(title, repo.legacyCatalog(path)) }.getOrElse { AppState.Failure("This shelf could not be opened.") }
    }

    fun search(query: String) = launch {
        if (query.trim().length < 2) return@launch
        _state.value = AppState.Loading
        _state.value = runCatching { AppState.Results("Results for “${query.trim()}”", repo.search(query.trim())) }.getOrElse { AppState.Failure("Search could not reach the archive.") }
    }

    fun detail(title: TitleCard) = launch {
        if (_state.value !is AppState.Loading && _state.value !is AppState.Detail) previousState = _state.value
        _state.value = AppState.Loading
        _state.value = runCatching { AppState.Detail(repo.detail(title)) }.getOrElse { AppState.Failure("This title file could not be opened.") }
    }

    fun recordRecent(title: TitleCard) { _recent.value = library.addRecent(title) }
    fun backFromDetail() { _state.value = previousState }
    fun toggleSaved(title: TitleCard) {
        _savedTitles.value = library.toggleSaved(title)
        _saved.value = _savedTitles.value.map { it.id }.toSet()
    }

    fun toggleTheme() { _darkTheme.value = !_darkTheme.value; library.setDarkTheme(_darkTheme.value) }
    fun refreshDownloads() { _downloads.value = library.downloads() }
    fun removeDownload(id: Long) { _downloads.value = library.removeDownload(id) }

    fun download(title: TitleCard, offer: Offer, onResult: (Boolean) -> Unit) = launch {
        val success = runCatching {
            val url = repo.resolve(offer)
            if (url.isBlank()) error("Empty file URL")
            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle(offer.label)
                .setDescription("FilmBase file")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, safeName(url, offer.label))
            val downloadId = (getApplication<Application>().getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
            library.addDownload(DownloadEntry(downloadId, title.title, offer.label, title.imageUrl, System.currentTimeMillis()))
            _downloads.value = library.downloads()
            true
        }.getOrDefault(false)
        onResult(success)
    }

    private fun safeName(url: String, label: String): String {
        val fromUrl = runCatching { URLDecoder.decode(Uri.parse(url).lastPathSegment.orEmpty(), StandardCharsets.UTF_8.toString()) }.getOrDefault("")
        if (fromUrl.contains('.') && fromUrl.length in 3..180) return fromUrl.replace(Regex("[^A-Za-z0-9._ -]"), "_")
        return label.replace(Regex("[^A-Za-z0-9._ -]"), "").trim().ifBlank { "filmbase-download" } + ".mp4"
    }
    private fun launch(block: suspend () -> Unit) = viewModelScope.launch(Dispatchers.IO) {
        runCatching { block() }.onFailure { _state.value = AppState.Failure("FilmBase hit a temporary problem. Please try again.") }
    }
}
