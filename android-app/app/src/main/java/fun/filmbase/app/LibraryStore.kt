package `fun`.filmbase.app

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject

data class DownloadEntry(
    val id: Long,
    val title: String,
    val label: String,
    val artwork: String?,
    val createdAt: Long,
    val status: Int = DownloadManager.STATUS_PENDING,
    val progress: Int = 0,
    val localUri: String? = null,
)

class LibraryStore(private val context: Context) {
    private val prefs = context.getSharedPreferences("filmbase-library", Context.MODE_PRIVATE)

    fun saved(): List<TitleCard> = decodeTitles(prefs.getString("saved", null))
    fun recent(): List<TitleCard> = decodeTitles(prefs.getString("recent", null))
    fun downloads(): List<DownloadEntry> = decodeDownloads(prefs.getString("downloads", null)).map(::withStatus)

    fun toggleSaved(title: TitleCard): List<TitleCard> {
        val items = saved().toMutableList()
        val index = items.indexOfFirst { it.id == title.id }
        if (index >= 0) items.removeAt(index) else items.add(0, title)
        prefs.edit().putString("saved", encodeTitles(items)).apply()
        return items
    }

    fun addRecent(title: TitleCard): List<TitleCard> {
        val items = recent().filterNot { it.id == title.id }.toMutableList()
        items.add(0, title)
        val trimmed = items.take(30)
        prefs.edit().putString("recent", encodeTitles(trimmed)).apply()
        return trimmed
    }

    fun addDownload(entry: DownloadEntry): List<DownloadEntry> {
        val items = decodeDownloads(prefs.getString("downloads", null)).toMutableList()
        items.add(0, entry)
        prefs.edit().putString("downloads", encodeDownloads(items.take(60))).apply()
        return downloads()
    }

    fun removeDownload(id: Long): List<DownloadEntry> {
        val items = decodeDownloads(prefs.getString("downloads", null)).filterNot { it.id == id }
        prefs.edit().putString("downloads", encodeDownloads(items)).apply()
        return downloads()
    }

    fun darkTheme(): Boolean = prefs.getBoolean("dark-theme", true)
    fun setDarkTheme(value: Boolean) = prefs.edit().putBoolean("dark-theme", value).apply()

    private fun withStatus(entry: DownloadEntry): DownloadEntry {
        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        return runCatching {
            manager.query(DownloadManager.Query().setFilterById(entry.id)).use { cursor ->
                if (!cursor.moveToFirst()) return@use entry
                val status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                val downloaded = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
                val total = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
                val uri = cursor.getString(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_LOCAL_URI))
                entry.copy(status = status, progress = if (total > 0) ((downloaded * 100) / total).toInt() else 0, localUri = uri)
            }
        }.getOrDefault(entry)
    }

    private fun encodeTitles(items: List<TitleCard>) = JSONArray().apply { items.forEach { put(it.json()) } }.toString()
    private fun decodeTitles(raw: String?): List<TitleCard> = runCatching {
        val array = JSONArray(raw ?: "[]")
        buildList { repeat(array.length()) { array.optJSONObject(it)?.let { value -> add(value.titleCard()) } } }
    }.getOrDefault(emptyList())

    private fun encodeDownloads(items: List<DownloadEntry>) = JSONArray().apply { items.forEach { entry -> put(JSONObject().put("id", entry.id).put("title", entry.title).put("label", entry.label).put("artwork", entry.artwork).put("createdAt", entry.createdAt)) } }.toString()
    private fun decodeDownloads(raw: String?): List<DownloadEntry> = runCatching {
        val array = JSONArray(raw ?: "[]")
        buildList { repeat(array.length()) { array.optJSONObject(it)?.let { value -> add(DownloadEntry(value.optLong("id"), value.optString("title"), value.optString("label"), value.optString("artwork").takeIf { image -> image.isNotBlank() && image != "null" }, value.optLong("createdAt"))) } } }
    }.getOrDefault(emptyList())
}

private fun TitleCard.json() = JSONObject().put("id", id).put("title", title).put("imageUrl", imageUrl).put("synopsis", synopsis).put("year", year).put("type", type).put("rating", rating).put("legacyPath", legacyPath)
private fun JSONObject.titleCard() = TitleCard(optString("id"), optString("title"), optString("imageUrl").takeIf { it.isNotBlank() && it != "null" }, optString("synopsis").takeIf { it.isNotBlank() && it != "null" }, optInt("year").takeIf { it > 0 }, optString("type", "title"), optDouble("rating").takeIf { !it.isNaN() && it > 0 }, optString("legacyPath").takeIf { it.isNotBlank() && it != "null" })
