# Hayvan Çiftliği

[![Canlı Demo](https://img.shields.io/badge/Canlı_Demo-Aç-2ea44f?style=for-the-badge)](https://animal-farm-3fio.onrender.com/)
[![Swagger UI](https://img.shields.io/badge/Swagger_UI-API'yi_Test_Et-85ea2d?style=for-the-badge&logo=swagger&logoColor=black)](https://animal-farm-3fio.onrender.com/swagger-ui.html)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rumeysaelif/animal-farm)

Spring Boot ile geliştirilmiş, çiftlikteki keçi, koyun ve tavukların yönetildiği bir REST API uygulamasıdır. Hayvanlar uygulama belleğinde birer nesne olarak tutulur; uygulama yeniden başlatıldığında veriler sıfırlanır.

## Projenin çalışma mantığı

- `Animal` soyut sınıfı hayvanların ortak özelliklerini taşır; `Goat`, `Sheep` ve `Chicken` sınıfları bu sınıftan türetilmiştir.
- `AnimalFactory`, seçilen türe uygun hayvan nesnesini oluşturur.
- `InMemoryAnimalRepository`, hayvanları uygulama belleğinde saklar.
- `AnimalService`, ekleme, listeleme, güncelleme, silme ve kapasite kontrollerini yürütür.
- `AnimalController`, bu işlemleri REST API üzerinden dışarı açar.
- Hatalı istekler ve bulunamayan hayvanlar merkezi hata yönetimiyle uygun HTTP cevaplarına dönüştürülür.

Uygulamada hayvan türleri sabittir: `GOAT`, `SHEEP` ve `CHICKEN`. API üzerinden türler ve sayıları listelenebilir; bir türe ait hayvanlar görüntülenebilir ve hayvan ekleme, güncelleme, silme işlemleri yapılabilir.

## Kullanılan teknolojiler

- Java 17
- Spring Boot
- Spring Web MVC ve Bean Validation
- Springdoc OpenAPI / Swagger UI
- JUnit ve Spring Boot Test
- Three.js tabanlı web arayüzü

## Çalıştırma

Gereksinim: JDK 17 veya sonrası.

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Uygulama başladıktan sonra:

- Web arayüzü: <http://localhost:8080/>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI tanımı: <http://localhost:8080/v3/api-docs>

## REST API

| Metot | Adres | Açıklama |
|---|---|---|
| `GET` | `/api/animal-types` | Hayvan türlerini ve tür başına hayvan sayısını getirir |
| `GET` | `/api/animal-types/{type}/animals` | Belirtilen türe ait hayvanları getirir |
| `GET` | `/api/animals/{id}` | ID ile bir hayvanı getirir |
| `POST` | `/api/animals` | Yeni hayvan ekler |
| `PUT` | `/api/animals/{id}` | Bir hayvanın bilgilerini günceller |
| `DELETE` | `/api/animals/{id}` | Bir hayvanı siler |

Örnek hayvan ekleme isteği:

```json
{
  "type": "GOAT",
  "name": "Boncuk",
  "gender": "FEMALE"
}
```

## Testler

```powershell
.\mvnw.cmd test
```

Üçüncü taraf görsel ve kod varlıklarının bilgileri [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) dosyasında yer alır.

## İnternette yayınlama

Yukarıdaki **Deploy to Render** butonu, projeyi bir Render hesabına web servisi olarak kurar. Ücretsiz servis kullanılmadığında uykuya geçebilir; bu nedenle ilk açılış yaklaşık bir dakika sürebilir. Servis yeniden başladığında bellekteki hayvan verileri başlangıç durumuna döner.
