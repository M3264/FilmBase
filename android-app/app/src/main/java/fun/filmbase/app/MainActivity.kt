package `fun`.filmbase.app

import android.os.Bundle
import android.app.DownloadManager
import android.content.Intent
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.BookmarkBorder
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.DeleteOutline
import androidx.compose.material.icons.rounded.Folder
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.History
import androidx.compose.material.icons.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay

private val Ink = Color(0xFFFFF8E9)
private val Navy = Color(0xFF081521)
private val Panel = Color(0xFF102536)
private val Gold = Color(0xFFFFB22F)
private val Coral = Color(0xFFFF8066)
private val Mint = Color(0xFF8EF0B0)
private val Steel = Color(0xFFA8B7C1)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { FilmBaseApp() }
    }
}

@Composable
fun FilmBaseApp(vm: MainViewModel = viewModel()) {
    val state by vm.state.collectAsState()
    val saved by vm.saved.collectAsState()
    val savedItems by vm.savedItems.collectAsState()
    val recent by vm.recent.collectAsState()
    val downloads by vm.downloads.collectAsState()
    var tab by rememberSaveable { mutableStateOf(0) }
    var detail by remember { mutableStateOf<TitleCard?>(null) }
    var downloadTarget by remember { mutableStateOf<Pair<TitleDetail, Offer>?>(null) }
    var query by rememberSaveable { mutableStateOf("") }
    val snack = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val openTitle: (TitleCard) -> Unit = { title -> vm.recordRecent(title); detail = title; downloadTarget = null; vm.detail(title) }
    val showChrome = detail == null && downloadTarget == null

    val colors = darkColorScheme(primary = Gold, onPrimary = Navy, secondary = Coral, onSecondary = Navy, tertiary = Mint, onTertiary = Navy, background = Navy, onBackground = Ink, surface = Panel, onSurface = Ink, surfaceVariant = Color(0xFF183246), onSurfaceVariant = Steel, outline = Color(0xFF466072))
    MaterialTheme(colorScheme = colors) {
        Scaffold(
            containerColor = Navy,
            snackbarHost = { SnackbarHost(snack) },
            bottomBar = {
                if (showChrome) NavigationBar(containerColor = Color(0xFF0B1D2D)) {
                    listOf("Home" to Icons.Rounded.Home, "Discover" to Icons.Rounded.Tune, "Search" to Icons.Rounded.Search, "Library" to Icons.Rounded.Folder).forEachIndexed { index, item ->
                        NavigationBarItem(selected = tab == index, onClick = {
                            tab = index
                            detail = null
                            downloadTarget = null
                            when (index) { 0 -> vm.home(); 1 -> vm.browse("latest", "Latest"); else -> Unit }
                        }, icon = { Icon(item.second, item.first) }, label = { Text(item.first) })
                    }
                }
            }
        ) { padding ->
            Column(Modifier.padding(padding).fillMaxSize()) {
                if (showChrome) AppHeader(onSearch = { tab = 2; detail = null })
                when {
                    downloadTarget != null -> DownloadDesk(downloadTarget!!.first, downloadTarget!!.second, vm, onBack = { downloadTarget = null }, onMessage = { scope.launch { snack.showSnackbar(it) } })
                    detail != null -> DetailScreen(detail!!, vm, saved, onBack = { vm.backFromDetail(); detail = null }, onOffer = { titleDetail, offer -> downloadTarget = titleDetail to offer }, onOpen = openTitle)
                    tab == 0 -> HomeScreen(state, saved, onOpen = openTitle, onBrowse = { tab = 1; vm.browse("latest", "Latest") })
                    tab == 1 -> BrowseScreen(vm, state, saved, onOpen = openTitle)
                    tab == 2 -> SearchScreen(vm, state, saved, query, onQuery = { query = it }, onOpen = openTitle)
                    else -> LibraryScreen(savedItems, recent, downloads, saved, vm, onOpen = openTitle)
                }
            }
        }
    }
}

@Composable private fun AppHeader(onSearch: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 13.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(38.dp).clip(RoundedCornerShape(11.dp)).background(Gold), contentAlignment = Alignment.Center) { Text("FB", color = Navy, fontWeight = FontWeight.Black, fontSize = 13.sp) }
        Column(Modifier.padding(start = 11.dp).weight(1f)) { Text("FilmBase", color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Black); Text("NEIGHBOURHOOD ARCHIVE", color = Steel, fontSize = 8.sp, letterSpacing = 1.6.sp, fontWeight = FontWeight.Bold) }
        IconButton(onClick = onSearch) { Icon(Icons.Rounded.Search, "Search", tint = Ink) }
    }
    Divider(color = Color.White.copy(alpha = .1f))
}

@Composable private fun HomeScreen(state: AppState, saved: Set<String>, onOpen: (TitleCard) -> Unit, onBrowse: () -> Unit) {
    when (state) {
        AppState.Loading -> LoadingScreen()
        is AppState.Failure -> FailureScreen(state.message)
        is AppState.Ready -> LazyColumn(contentPadding = PaddingValues(bottom = 24.dp)) {
            item { FeaturePanel(state.shelves.flatMap { it.titles }.firstOrNull { it.imageUrl != null } ?: state.shelves.firstOrNull()?.titles?.firstOrNull(), onOpen) }
            item { TransmissionStrip(listOf("Action", "Nollywood", "K-Drama", "Series", "Anime", "World cinema"), onBrowse) }
            item { MixedPosterWall(state.shelves.flatMap { it.titles }.distinctBy { it.id }.filter { it.imageUrl != null }.take(8), onOpen) }
            item { FilmBaseCounter(state.shelves.take(4), saved, onOpen, onBrowse) }
            items(state.shelves.drop(4)) { shelf -> ShelfRow(shelf, saved, onOpen) }
        }
        else -> Unit
    }
}

@Composable private fun TransmissionStrip(labels: List<String>, onBrowse: () -> Unit) {
    Row(Modifier.fillMaxWidth().background(Gold).horizontalScroll(rememberScrollState()).clickable(onClick = onBrowse).padding(vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
        Text("●  LIVE SHELVES", color = Navy, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.2.sp, modifier = Modifier.padding(horizontal = 18.dp))
        labels.forEachIndexed { index, label -> Text("${"%02d".format(index + 1)}  $label   →", color = Navy, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(end = 22.dp)) }
    }
}

@Composable private fun MixedPosterWall(items: List<TitleCard>, onOpen: (TitleCard) -> Unit) {
    if (items.isEmpty()) return
    Column(Modifier.padding(horizontal = 18.dp, vertical = 32.dp)) {
        Text("POSTER WALL", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.6.sp)
        Row(Modifier.fillMaxWidth().padding(top = 9.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items.take(4).forEachIndexed { index, item ->
                Box(Modifier.weight(1f).height(if (index % 2 == 0) 146.dp else 174.dp).border(2.dp, if (index == 1) Gold else Ink.copy(alpha = .42f), RoundedCornerShape(9.dp)).padding(3.dp).clip(RoundedCornerShape(6.dp)).clickable { onOpen(item) }) { AsyncImage(item.imageUrl, item.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 8.dp), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items.drop(4).take(4).forEachIndexed { index, item ->
                Box(Modifier.weight(1f).height(if (index % 2 == 0) 172.dp else 142.dp).border(2.dp, if (index == 2) Coral else Ink.copy(alpha = .42f), RoundedCornerShape(9.dp)).padding(3.dp).clip(RoundedCornerShape(6.dp)).clickable { onOpen(item) }) { AsyncImage(item.imageUrl, item.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
            }
        }
        Text("A MIX OF ROOMS, COUNTRIES AND LATE-NIGHT FINDS", color = Steel, fontSize = 9.sp, letterSpacing = 1.1.sp, modifier = Modifier.padding(top = 12.dp))
    }
}

@Composable private fun FilmBaseCounter(shelves: List<Shelf>, saved: Set<String>, onOpen: (TitleCard) -> Unit, onBrowse: () -> Unit) {
    if (shelves.isEmpty()) return
    var selected by remember { mutableStateOf(0) }
    val pick = shelves.getOrNull(selected)?.titles?.firstOrNull()
    Column(Modifier.padding(horizontal = 16.dp, vertical = 18.dp)) {
        Row(verticalAlignment = Alignment.Bottom) { Column(Modifier.weight(1f)) { Text("FILMBASE COUNTER", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp); Text("Ask what just came in.", color = Ink, fontSize = 28.sp, lineHeight = 29.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 5.dp)) }; TextButton(onClick = onBrowse) { Text("All shelves →", color = Ink) } }
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(top = 16.dp), horizontalArrangement = Arrangement.spacedBy(7.dp)) { shelves.forEachIndexed { index, shelf -> FilterChip("${"%02d".format(index + 1)}  ${shelf.name}", selected == index) { selected = index } } }
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0C2030)), shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth().padding(top = 12.dp).clickable { pick?.let(onOpen) }) {
            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.width(112.dp).height(154.dp).clip(RoundedCornerShape(13.dp)).background(Panel), contentAlignment = Alignment.Center) { Text(pick?.title?.take(2)?.uppercase().orEmpty(), color = Steel.copy(.35f), fontSize = 30.sp, fontWeight = FontWeight.Black); pick?.imageUrl?.let { AsyncImage(it, pick.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) } }
                Column(Modifier.padding(start = 15.dp).weight(1f)) { Text("CLERK'S PICK", color = Mint, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.3.sp); Text(pick?.title ?: shelves[selected].name, color = Ink, fontSize = 20.sp, lineHeight = 22.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp)); Text(pick?.synopsis ?: "Filed today and ready at the counter.", color = Steel, fontSize = 12.sp, lineHeight = 17.sp, maxLines = 4, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 8.dp)); Text(if (pick?.id in saved) "SAVED TO YOUR PINBOARD" else "OPEN TITLE FILE  →", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 11.dp)) }
            }
        }
    }
}

@Composable private fun FeaturePanel(item: TitleCard?, onOpen: (TitleCard) -> Unit) {
    Box(Modifier.padding(horizontal = 16.dp).fillMaxWidth().height(340.dp).clip(RoundedCornerShape(24.dp)).background(Panel)) {
        if (item?.imageUrl != null) AsyncImage(item.imageUrl, item.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Navy.copy(alpha = .98f)))))
        Column(Modifier.align(Alignment.BottomStart).padding(22.dp)) {
            Text("ON THE FRONT DESK", color = Mint, fontSize = 10.sp, letterSpacing = 1.5.sp, fontWeight = FontWeight.Bold)
            Text(item?.title ?: "A new night at FilmBase", color = Ink, fontSize = 29.sp, lineHeight = 31.sp, fontWeight = FontWeight.Black, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 6.dp))
            Row(Modifier.padding(top = 15.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = { item?.let(onOpen) }, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy), shape = RoundedCornerShape(12.dp)) { Text("Open title", fontWeight = FontWeight.Bold) }
                Text("LIVE CATALOGUE", color = Steel, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.CenterVertically))
            }
        }
    }
}

@Composable private fun ShelfRow(shelf: Shelf, saved: Set<String>, onOpen: (TitleCard) -> Unit) {
    Column(Modifier.padding(bottom = 27.dp)) {
        Row(Modifier.padding(horizontal = 18.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) { Text(shelf.name, color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Black); Spacer(Modifier.weight(1f)); Text("%02d".format(shelf.titles.size), color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
        LazyRow(contentPadding = PaddingValues(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) { itemsIndexed(shelf.titles) { index, title -> PosterCard(title, index, saved.contains(title.id), onOpen) } }
    }
}

@Composable private fun PosterCard(item: TitleCard, index: Int, isSaved: Boolean, onOpen: (TitleCard) -> Unit) {
    Column(Modifier.width(142.dp).clickable { onOpen(item) }) {
        Box(Modifier.fillMaxWidth().height(194.dp).clip(RoundedCornerShape(15.dp)).background(if (index % 3 == 0) Color(0xFF263F52) else Panel), contentAlignment = Alignment.Center) {
            Text(item.title.split(' ').take(2).mapNotNull { it.firstOrNull() }.joinToString("").uppercase(), color = Steel.copy(alpha = .35f), fontSize = 36.sp, fontWeight = FontWeight.Black)
            if (item.imageUrl != null) AsyncImage(item.imageUrl, item.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            Box(Modifier.align(Alignment.TopStart).padding(8.dp).clip(RoundedCornerShape(7.dp)).background(if (index % 3 == 0) Gold else Coral).padding(horizontal = 7.dp, vertical = 4.dp)) { Text("%02d".format(index + 1), color = Navy, fontSize = 10.sp, fontWeight = FontWeight.Black) }
            if (isSaved) Icon(Icons.Rounded.Bookmark, "Saved", tint = Gold, modifier = Modifier.align(Alignment.TopEnd).padding(9.dp).size(18.dp))
        }
        Text(item.title, color = Ink, fontSize = 13.sp, lineHeight = 16.sp, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 8.dp, start = 2.dp))
        Text(meta(item), color = Steel, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp, start = 2.dp))
    }
}

@Composable private fun BrowseScreen(vm: MainViewModel, state: AppState, saved: Set<String>, onOpen: (TitleCard) -> Unit) {
    var filter by rememberSaveable { mutableStateOf("latest") }
    val filters = listOf("latest" to "Latest", "trending" to "Trending", "nollywood" to "Nollywood", "kdrama" to "K-Drama")
    LaunchedEffect(Unit) { if (state !is AppState.Results && state !is AppState.Loading) vm.browse("latest", "Latest") }
    Column(Modifier.fillMaxSize()) {
        Column(Modifier.padding(horizontal = 18.dp, vertical = 18.dp)) { Text("BROWSE THE ARCHIVE", color = Gold, fontSize = 11.sp, letterSpacing = 1.6.sp, fontWeight = FontWeight.Bold); Text("Pick a shelf.", color = Ink, fontSize = 32.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp)) }
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) { filters.forEach { (key, label) -> FilterChip(label, filter == key) { filter = key; if (key == "nollywood") vm.legacyBrowse("category/nollywood/", label) else if (key == "kdrama") vm.legacyBrowse("category/korean-drama/", label) else vm.browse(key, label) } } }
        BrowseState(state, saved, onOpen)
    }
}

@Composable private fun BrowseState(state: AppState, saved: Set<String>, onOpen: (TitleCard) -> Unit) {
    when (state) { AppState.Loading -> LoadingScreen(); is AppState.Results -> GridResults(state.items, saved, onOpen); is AppState.Failure -> FailureScreen(state.message); else -> LoadingScreen() }
}

@Composable private fun GridResults(items: List<TitleCard>, saved: Set<String>, onOpen: (TitleCard) -> Unit) {
    if (items.isEmpty()) return FailureScreen("This shelf is empty right now.")
    LazyColumn(contentPadding = PaddingValues(18.dp, 18.dp, 18.dp, 26.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) { items(items.chunked(2)) { pair -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { pair.forEachIndexed { index, item -> PosterCard(item, index, saved.contains(item.id), onOpen); if (index == 0 && pair.size == 1) Spacer(Modifier.width(142.dp)) } } } }
}

@Composable private fun SearchScreen(vm: MainViewModel, state: AppState, saved: Set<String>, query: String, onQuery: (String) -> Unit, onOpen: (TitleCard) -> Unit) {
    Column(Modifier.fillMaxSize()) {
        Column(Modifier.padding(horizontal = 18.dp, vertical = 20.dp)) { Text("REQUEST DESK", color = Gold, fontSize = 11.sp, letterSpacing = 1.6.sp, fontWeight = FontWeight.Bold); Text("Ask for a title.", color = Ink, fontSize = 32.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp)) }
        Row(Modifier.padding(horizontal = 18.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(value = query, onValueChange = onQuery, modifier = Modifier.weight(1f), placeholder = { Text("Film, actor, country…") }, singleLine = true, shape = RoundedCornerShape(13.dp))
            Spacer(Modifier.width(8.dp)); IconButton(onClick = { vm.search(query) }, modifier = Modifier.size(55.dp).clip(RoundedCornerShape(13.dp)).background(Gold)) { Icon(Icons.Rounded.Search, "Search", tint = Navy) }
        }
        when (state) { AppState.Loading -> LoadingScreen(); is AppState.Results -> GridResults(state.items, saved, onOpen); is AppState.Failure -> FailureScreen(state.message); else -> EmptyHint() }
    }
}

@Composable private fun LibraryScreen(savedItems: List<TitleCard>, recent: List<TitleCard>, downloads: List<DownloadEntry>, saved: Set<String>, vm: MainViewModel, onOpen: (TitleCard) -> Unit) {
    var room by rememberSaveable { mutableStateOf(0) }
    val rooms = listOf("Saved", "Recent", "Downloads")
    if (room == 2) LaunchedEffect(Unit) { while (true) { vm.refreshDownloads(); delay(2_500) } }
    Column(Modifier.fillMaxSize()) {
        Column(Modifier.padding(horizontal = 18.dp, vertical = 18.dp)) { Text("YOUR FILMBASE", color = Gold, fontSize = 11.sp, letterSpacing = 1.6.sp, fontWeight = FontWeight.Bold); Text("The back room.", color = Ink, fontSize = 32.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp)); Row(Modifier.padding(top = 14.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) { rooms.forEachIndexed { index, label -> FilterChip(label, room == index) { room = index } } } }
        when (room) {
            0 -> if (savedItems.isEmpty()) EmptyHint("Bookmark a title and it will wait here.") else GridResults(savedItems, saved, onOpen)
            1 -> if (recent.isEmpty()) EmptyHint("Titles you open will appear here.") else GridResults(recent, saved, onOpen)
            else -> DownloadsRoom(downloads, vm)
        }
    }
}

@Composable private fun DownloadsRoom(downloads: List<DownloadEntry>, vm: MainViewModel) {
    val context = LocalContext.current
    if (downloads.isEmpty()) return EmptyHint("Downloads you start from the download desk will appear here.")
    LazyColumn(contentPadding = PaddingValues(horizontal = 18.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items(downloads, key = { it.id }) { entry ->
            Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(17.dp), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(58.dp).clip(RoundedCornerShape(11.dp)).background(Color(0xFF20394C)), contentAlignment = Alignment.Center) { if (entry.artwork != null) AsyncImage(entry.artwork, entry.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) else Icon(Icons.Rounded.Download, null, tint = Gold) }
                    Column(Modifier.padding(start = 12.dp).weight(1f)) { Text(entry.title, color = Ink, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis); Text(entry.label, color = Steel, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis); Text(downloadStatus(entry), color = if (entry.status == DownloadManager.STATUS_SUCCESSFUL) Mint else Gold, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 5.dp)); if (entry.status == DownloadManager.STATUS_RUNNING) LinearProgressIndicator(progress = { entry.progress / 100f }, modifier = Modifier.fillMaxWidth().padding(top = 7.dp), color = Gold) }
                    IconButton(onClick = { if (entry.status == DownloadManager.STATUS_SUCCESSFUL) context.startActivity(Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)) else vm.removeDownload(entry.id) }) { Icon(if (entry.status == DownloadManager.STATUS_SUCCESSFUL) Icons.Rounded.OpenInNew else Icons.Rounded.DeleteOutline, if (entry.status == DownloadManager.STATUS_SUCCESSFUL) "Open downloads" else "Remove", tint = Ink) }
                }
            }
        }
    }
}

private fun downloadStatus(entry: DownloadEntry) = when (entry.status) { DownloadManager.STATUS_SUCCESSFUL -> "READY IN DOWNLOADS"; DownloadManager.STATUS_RUNNING -> "DOWNLOADING · ${entry.progress}%"; DownloadManager.STATUS_PAUSED -> "PAUSED BY ANDROID"; DownloadManager.STATUS_FAILED -> "DOWNLOAD FAILED"; else -> "WAITING TO START" }

@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun DetailScreen(seed: TitleCard, vm: MainViewModel, saved: Set<String>, onBack: () -> Unit, onOffer: (TitleDetail, Offer) -> Unit, onOpen: (TitleCard) -> Unit) {
    val state by vm.state.collectAsState()
    val item = (state as? AppState.Detail)?.item
    if (state is AppState.Loading || item == null) { LoadingScreen(); return }
    val detail = item
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 30.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 5.dp), verticalAlignment = Alignment.CenterVertically) { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Rounded.ArrowBack, "Back", tint = Ink) }; Text("TITLE FILE", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp); Spacer(Modifier.weight(1f)); IconButton(onClick = { vm.toggleSaved(detail.card) }) { Icon(if (detail.card.id in saved) Icons.Rounded.Bookmark else Icons.Rounded.BookmarkBorder, "Save", tint = Gold) } }
        if (detail.card.imageUrl != null) AsyncImage(detail.card.imageUrl, detail.card.title, Modifier.padding(horizontal = 18.dp).fillMaxWidth().height(310.dp).clip(RoundedCornerShape(22.dp)), contentScale = ContentScale.Crop)
        Column(Modifier.padding(horizontal = 18.dp, vertical = 19.dp)) {
            Text(meta(detail.card), color = Mint, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.1.sp)
            Text(detail.card.title, color = Ink, fontSize = 31.sp, lineHeight = 34.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 7.dp))
            detail.synopsis?.takeIf { it.isNotBlank() }?.let { Text(it, color = Steel, fontSize = 15.sp, lineHeight = 23.sp, modifier = Modifier.padding(top = 13.dp)) }
            if (detail.cast.isNotEmpty()) Text("Featuring · ${detail.cast.take(7).joinToString()}", color = Steel, fontSize = 12.sp, modifier = Modifier.padding(top = 13.dp))
            Text("AVAILABLE FILES", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.6.sp, modifier = Modifier.padding(top = 29.dp, bottom = 10.dp))
            if (detail.offers.isEmpty()) Text("No verified files are available yet.", color = Steel)
            detail.offers.forEachIndexed { index, offer -> OfferRow(index, offer) { onOffer(detail, offer) } }
            if (detail.screenshots.isNotEmpty()) { Text("A CLOSER LOOK", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.6.sp, modifier = Modifier.padding(top = 29.dp, bottom = 10.dp)); LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) { items(detail.screenshots) { shot -> AsyncImage(shot, "Screenshot", Modifier.width(240.dp).height(140.dp).clip(RoundedCornerShape(12.dp)), contentScale = ContentScale.Crop) } } }
            if (detail.related.isNotEmpty()) { Text("MORE FROM THE ARCHIVE", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.6.sp, modifier = Modifier.padding(top = 29.dp, bottom = 10.dp)); LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) { items(detail.related) { related -> PosterCard(related, 0, related.id in saved, onOpen) } } }
        }
    }
}

@Composable private fun OfferRow(index: Int, offer: Offer, onDownload: () -> Unit) { Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(15.dp), modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) { Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) { Text("%02d".format(index + 1), color = Gold, fontWeight = FontWeight.Black, modifier = Modifier.width(38.dp)); Column(Modifier.weight(1f)) { Text(offer.label, color = Ink, fontWeight = FontWeight.Bold); Text("Verified external file", color = Steel, fontSize = 11.sp) }; Button(onClick = onDownload, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy), shape = RoundedCornerShape(10.dp), contentPadding = PaddingValues(horizontal = 11.dp)) { Icon(Icons.Rounded.Download, "Download", Modifier.size(16.dp)); Spacer(Modifier.width(4.dp)); Text("Get", fontWeight = FontWeight.Bold) } } } }

@Composable private fun DownloadDesk(detail: TitleDetail, offer: Offer, vm: MainViewModel, onBack: () -> Unit, onMessage: (String) -> Unit) {
    var starting by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 32.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Rounded.ArrowBack, "Back", tint = Ink) }; Text("DOWNLOAD DESK", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp) }
        Column(Modifier.padding(horizontal = 18.dp)) {
            Text("Take it home.", color = Ink, fontSize = 34.sp, fontWeight = FontWeight.Black, lineHeight = 37.sp)
            Text("A direct file offer from the FilmBase archive.", color = Steel, fontSize = 14.sp, modifier = Modifier.padding(top = 7.dp, bottom = 20.dp))
            Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(21.dp), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(88.dp).clip(RoundedCornerShape(13.dp)).background(Color(0xFF20394C)), contentAlignment = Alignment.Center) { detail.card.imageUrl?.let { AsyncImage(it, detail.card.title, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) } ?: Text(detail.card.title.take(2).uppercase(), color = Steel, fontSize = 28.sp, fontWeight = FontWeight.Black) }; Column(Modifier.padding(start = 14.dp)) { Text(detail.card.title, color = Ink, fontSize = 17.sp, fontWeight = FontWeight.Black, maxLines = 2, overflow = TextOverflow.Ellipsis); Text(offer.label, color = Gold, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 7.dp)); Text(listOfNotNull(offer.quality, offer.size, "External file").joinToString(" · "), color = Steel, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp)) } }
            }
            Text("WHAT HAPPENS NEXT", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp, modifier = Modifier.padding(top = 30.dp, bottom = 10.dp))
            listOf("FilmBase prepares the direct file offer.", "Android saves it in your Downloads folder.", "Track progress later from Library → Downloads.").forEachIndexed { index, text -> Row(Modifier.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(27.dp).clip(RoundedCornerShape(8.dp)).background(if (index == 0) Gold else Color(0xFF244155)), contentAlignment = Alignment.Center) { Text("${index + 1}", color = if (index == 0) Navy else Ink, fontWeight = FontWeight.Black, fontSize = 11.sp) }; Text(text, color = Steel, fontSize = 13.sp, modifier = Modifier.padding(start = 11.dp)) } }
            Button(onClick = { starting = true; vm.download(detail.card, offer) { ok -> starting = false; onMessage(if (ok) "Download started — check Library → Downloads" else "This file could not be prepared") } }, enabled = !starting, modifier = Modifier.fillMaxWidth().padding(top = 22.dp).height(55.dp), colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy), shape = RoundedCornerShape(14.dp)) { if (starting) CircularProgressIndicator(Modifier.size(19.dp), color = Navy, strokeWidth = 2.dp) else { Icon(Icons.Rounded.Download, "Start download"); Spacer(Modifier.width(8.dp)); Text("Start download", fontWeight = FontWeight.Black) } }
            Text("Downloads are explicit external offers. FilmBase never disguises ads as file actions.", color = Steel.copy(alpha = .75f), fontSize = 10.sp, lineHeight = 15.sp, modifier = Modifier.padding(top = 16.dp))
        }
    }
}

@Composable private fun FilterChip(label: String, selected: Boolean, onClick: () -> Unit) { Surface(onClick = onClick, color = if (selected) Gold else Panel, contentColor = if (selected) Navy else Ink, shape = RoundedCornerShape(30.dp), modifier = Modifier.height(38.dp)) { Box(Modifier.padding(horizontal = 16.dp), contentAlignment = Alignment.Center) { Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold) } } }
@Composable private fun LoadingScreen() { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Gold) } }
@Composable private fun FailureScreen(message: String) { Box(Modifier.fillMaxSize().padding(30.dp), contentAlignment = Alignment.Center) { Text(message, color = Steel, fontSize = 15.sp) } }
@Composable private fun EmptyHint(message: String = "Search the archive to get started.") { Box(Modifier.fillMaxSize().padding(30.dp), contentAlignment = Alignment.Center) { Text(message, color = Steel, fontSize = 15.sp) } }
private fun meta(item: TitleCard) = listOfNotNull(item.year?.toString(), item.type.takeIf { it.isNotBlank() }?.uppercase(), item.rating?.let { "★ %.1f".format(it) }).joinToString(" · ").ifBlank { "TITLE FILE" }
