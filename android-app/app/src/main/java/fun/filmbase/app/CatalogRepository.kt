package `fun`.filmbase.app

import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

data class TitleCard(
    val id: String,
    val title: String,
    val imageUrl: String? = null,
    val synopsis: String? = null,
    val year: Int? = null,
    val type: String = "title",
    val rating: Double? = null,
    val legacyPath: String? = null,
)

data class Shelf(val name: String, val titles: List<TitleCard>)
data class Offer(val id: String, val label: String, val legacyUrl: String? = null, val quality: String? = null, val size: String? = null)
data class TitleDetail(
    val card: TitleCard,
    val synopsis: String?,
    val cast: List<String>,
    val offers: List<Offer>,
    val related: List<TitleCard>,
    val screenshots: List<String> = emptyList(),
)

class CatalogRepository {
    private val api2 = "https://api2.filmbase.fun"
    private val legacy = "https://api.filmbase.fun"

    suspend fun home(): List<Shelf> {
        val sections = get(api2, "/v1/home").optJSONObject("data")?.optJSONArray("sections") ?: JSONArray()
        val names = listOf("Fresh at the counter", "Series weekend", "World cinema", "After midnight", "Crowd favourites", "More arrivals")
        return buildList {
            repeat(minOf(sections.length(), 6)) { index ->
                val titles = sections.optJSONObject(index)?.optJSONArray("titles").cards()
                if (titles.isNotEmpty()) add(Shelf(names[index % names.size], titles.take(14)))
            }
        }
    }

    suspend fun catalog(kind: String): List<TitleCard> =
        get(api2, "/v1/catalog?category=${enc(kind)}&page=1").optJSONArray("data").cards()

    suspend fun legacyCatalog(path: String): List<TitleCard> =
        get(legacy, "/api/list/${enc(path)}?page=1").optJSONObject("data")?.optJSONArray("items").legacyCards()

    suspend fun search(query: String): List<TitleCard> =
        get(api2, "/v1/search?q=${enc(query)}").optJSONArray("data").cards()

    suspend fun detail(seed: TitleCard): TitleDetail = if (seed.legacyPath != null) legacyDetail(seed) else api2Detail(seed)

    private fun api2Detail(seed: TitleCard): TitleDetail {
        val data = get(api2, "/v1/titles/${enc(seed.id)}").optJSONObject("data") ?: JSONObject()
        val card = data.card().copy(imageUrl = data.optStringOrNull("imageUrl") ?: seed.imageUrl)
        return TitleDetail(
            card,
            data.optStringOrNull("synopsis") ?: seed.synopsis,
            data.optJSONArray("cast").strings(),
            data.optJSONArray("offers").offers(false),
            emptyList(),
            data.optJSONArray("screenshots").strings(),
        )
    }

    private fun legacyDetail(seed: TitleCard): TitleDetail {
        val data = get(legacy, "/api/movie/${enc(seed.legacyPath.orEmpty())}").optJSONObject("data") ?: JSONObject()
        val downloads = data.optJSONArray("downloadItems")
        return TitleDetail(
            seed.copy(title = data.optString("title", seed.title), synopsis = data.optStringOrNull("synopsis") ?: seed.synopsis),
            data.optStringOrNull("synopsis") ?: seed.synopsis,
            emptyList(),
            downloads.offers(true),
            data.optJSONArray("relatedMovies").legacyCards(),
        )
    }

    suspend fun resolve(offer: Offer): String {
        if (offer.legacyUrl != null) {
            val body = JSONObject().put("intermediateUrl", offer.legacyUrl).toString()
            return request(legacy, "/api/resolve-link", "POST", body).optString("directLink")
        }
        return request(api2, "/v1/offers/${enc(offer.id)}/resolve", "POST", "")
            .optJSONObject("data")?.optString("url").orEmpty()
    }

    private fun get(base: String, path: String) = request(base, path, "GET", null)

    private fun request(base: String, path: String, method: String, body: String?): JSONObject {
        val connection = URI(base + path).toURL().openConnection() as HttpURLConnection
        return try {
            connection.requestMethod = method
            connection.connectTimeout = 12_000
            connection.readTimeout = 35_000
            connection.setRequestProperty("Accept", "application/json")
            connection.setRequestProperty("User-Agent", "FilmBaseAndroid/2.0")
            if (method == "POST") {
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                connection.outputStream.use { it.write((body ?: "").toByteArray()) }
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val text = stream.bufferedReader().use { it.readText() }
            if (status !in 200..299) error("FilmBase API returned $status")
            JSONObject(text)
        } finally { connection.disconnect() }
    }

    private fun enc(value: String) = URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
}

private fun JSONArray?.cards(): List<TitleCard> = buildList {
    if (this@cards == null) return@buildList
    repeat(length()) { optJSONObject(it)?.let { value -> add(value.card()) } }
}

private fun JSONObject.card() = TitleCard(
    id = optString("id", optString("path")),
    title = optString("title", "Untitled"),
    imageUrl = optStringOrNull("imageUrl"),
    synopsis = optStringOrNull("synopsis") ?: optStringOrNull("summary"),
    year = optInt("year").takeIf { it > 0 },
    type = optString("type", "title"),
    rating = optDouble("rating").takeIf { !it.isNaN() && it > 0 },
)

private fun JSONArray?.legacyCards(): List<TitleCard> = buildList {
    if (this@legacyCards == null) return@buildList
    repeat(length()) {
        optJSONObject(it)?.let { value ->
            val path = value.optString("path")
            val rawImage = value.optStringOrNull("imageUrl")
            val image = when {
                rawImage == null -> null
                rawImage.startsWith("/") -> "https://filmbase.fun/api/image?url=${UriEncoder.encode("https://9jarocks.net$rawImage")}"
                else -> rawImage
            }
            add(TitleCard("legacy:$path", value.optString("title", "Untitled"), image, value.optStringOrNull("summary"), legacyPath = path))
        }
    }
}

private fun JSONArray?.offers(legacy: Boolean): List<Offer> = buildList {
    if (this@offers == null) return@buildList
    repeat(length()) {
        optJSONObject(it)?.let { value ->
            add(Offer(
                id = value.optString("id", "legacy-$it"),
                label = value.optString(if (legacy) "text" else "label", "Movie file").replace(Regex("^download\\s*", RegexOption.IGNORE_CASE), "").ifBlank { "Movie file" },
                legacyUrl = if (legacy) value.optStringOrNull("intermediateUrl") else null,
                quality = value.optStringOrNull("quality"),
                size = value.optStringOrNull("size"),
            ))
        }
    }
}

private fun JSONArray?.strings(): List<String> = buildList {
    if (this@strings == null) return@buildList
    repeat(length()) { optString(it).takeIf(String::isNotBlank)?.let(::add) }
}

private fun JSONObject.optStringOrNull(name: String): String? = optString(name).takeIf { it.isNotBlank() && it != "null" }
private object UriEncoder { fun encode(value: String) = URLEncoder.encode(value, StandardCharsets.UTF_8.toString()) }
