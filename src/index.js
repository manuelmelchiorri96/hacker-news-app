import axios from "axios";
import _ from "lodash";
import "./css/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";

class ApplicazioneHackerNews {
  constructor() {
    axios.defaults.baseURL = "https://hacker-news.firebaseio.com/v0/";
    this.apiURL = axios.defaults.baseURL;
    this.elencoNews = document.querySelector("#elenco-news");
    this.pulsanteCaricaAltro = document.querySelector("#carica-altro");
    this.indiceAttualeNews = 0;

    this.impostaGestoriEventi();
    this.caricaNews();
  }

  // effettuo richieste HTTP utilizzando Axios
  async fetchDati(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Errore nella richiesta: ${error.message}`);
      throw error;
    }
  }

  // Carico i dettagli di una singola notizia dal suo ID
  async caricaDettagliNews(id) {
    const dettagliNews = await this.fetchDati(`${this.apiURL}item/${id}.json`);
    this.mostraDettagliNews(dettagliNews);
  }

  // Carico un batch di notizie in base alla dimensione specificata
  async caricaBatchNews(batchSize) {
    try {
      this.mostraIndicatoreCaricamento();

      // Ottengo l'elenco di ID delle nuove storie
      const idNews = await this.fetchDati(`${this.apiURL}newstories.json`);

      // Seleziono un batch di notizie in base all'indice attuale
      const batchNews = idNews.slice(
        this.indiceAttualeNews,
        this.indiceAttualeNews + batchSize
      );

      // Ordino le notizie utilizzando Lodash
      const sortedBatchNews = _.sortBy(batchNews, (id) => -id);

      // Carico i dettagli di ogni notizia nel batch
      await Promise.all(
        _.map(sortedBatchNews, async (id) => await this.caricaDettagliNews(id))
      );

      // Aggiorno l'indice attuale delle notizie
      this.indiceAttualeNews += batchSize;
    } catch (error) {
      console.error(
        "Errore durante il caricamento delle notizie:",
        error.message
      );
    } finally {
      this.nascondiIndicatoreCaricamento();
    }
  }

  // Mostro i dettagli di una notizia nell'interfaccia utente utilizzando Lodash
  mostraDettagliNews(dettagliNews) {
    const titoloOriginale = _.get(dettagliNews, "title", "");
    const titoloFormattato = _.chain(titoloOriginale)
      .toLower()
      .capitalize()
      .value();
    const elementoNews = document.createElement("a");

    elementoNews.href = dettagliNews.url;
    elementoNews.target = "_blank";
    elementoNews.classList.add("list-group-item", "list-group-item-action");
    elementoNews.innerHTML = `
      <h5 class="mb-1">${titoloFormattato}</h5>
      <p class="mb-1">Data: ${new Date(
        dettagliNews.time * 1000
      ).toLocaleString()}</p>
      <small>Leggi di più</small>
    `;

    this.elencoNews.appendChild(elementoNews);
  }

  // Mostra l'indicatore di caricamento
  mostraIndicatoreCaricamento() {
    const indicatoreCaricamento = document.querySelector(
      "#indicatore-caricamento"
    );

    indicatoreCaricamento.style.display = "block";
    this.elencoNews.style.display = "none";
  }

  // Nasconde l'indicatore di caricamento
  nascondiIndicatoreCaricamento() {
    const indicatoreCaricamento = document.querySelector(
      "#indicatore-caricamento"
    );

    indicatoreCaricamento.style.display = "none";
    this.elencoNews.style.display = "block";
  }

  // Imposto il gestore degli eventi (click) per il pulsante di caricamento
  impostaGestoriEventi() {
    this.pulsanteCaricaAltro.addEventListener("click", () => this.caricaNews());
  }

  // Carico un nuovo batch di notizie all'invocazione di questo metodo
  async caricaNews() {
    this.mostraIndicatoreCaricamento();

    try {
      const batchSize = 10;
      await this.caricaBatchNews(batchSize);
    } catch (error) {
      console.error(
        "Errore durante il caricamento delle notizie:",
        error.message
      );
    } finally {
      this.nascondiIndicatoreCaricamento();
    }
  }
}

const app = new ApplicazioneHackerNews();
