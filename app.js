/* ==========================================================================
   L'ESCALE 241 — LOGIQUE MÉTIER, CAISSE HORS-LIGNE ET ADMINISTRATION (app.js)
   Persistance intégrale via localStorage :
   - escale_catalogue_v1 : Carte complète des boissons, plats et accompagnements
   - escale_salle_v1     : Tables 1 à 16 et Comptoir 1 à 4
   - escale_commandes_v1 : Tickets actifs par emplacement
   - escale_historique_v1: Journal des encaissements de la soirée
   ========================================================================== */

(function () {
  'use strict';

  const CLES_STOCKAGE = {
    CATALOGUE: 'escale_catalogue_v1',
    SALLE: 'escale_salle_v1',
    COMMANDES: 'escale_commandes_v1',
    HISTORIQUE: 'escale_historique_v1',
    COMPTEUR_REF: 'escale_compteur_ref_v1'
  };

  /* ------------------------------------------------------------------------
     1. DONNÉES INITIALES : CARTE EXACTE DE L'ESCALE 241 & PLAN DE SALLE
     ------------------------------------------------------------------------ */
  const CATALOGUE_INITIAL = [
    // Bières à 3€ (Éligibles à la Formule 4 boissons à 10€)
    { id: 'b-leffe', nom: 'Bière Leffe', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-despe', nom: 'Bière Desperados', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-heineken', nom: 'Bière Heineken', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-guinness', nom: 'Bière Guinness', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-autre', nom: 'Bière 3 € (autre référence)', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },

    // Jus & Softs à 2€ (Éligibles à la Formule 4 boissons à 10€) + Eau 1€
    { id: 'j-coca', nom: 'Coca-Cola', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-fanta', nom: 'Fanta', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-orangina', nom: 'Orangina', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-redbull', nom: 'RedBull', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-sprite', nom: 'Sprite', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-caraibos', nom: 'Caraïbos Litchi', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-eau', nom: 'Eau', prix: 1.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: false },

    // Bières Africaines & Cocktails
    { id: 'ba-regab', nom: 'Regab', prix: 6.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ba-beaufort', nom: 'Beaufort', prix: 4.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-whisky-cola', nom: 'Booster — Whisky Cola', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-zombie', nom: 'Booster — Zombie', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-banana', nom: 'Booster — Banana Mama', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-autre', nom: 'Booster (autre cocktail)', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'al-flash', nom: 'Alcool Flash', prix: 15.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },

    // Vins, Champagnes & Bouteilles
    { id: 'vn-petit', nom: 'Petit vin', prix: 5.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'vn-muscador', nom: 'Muscador', prix: 10.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'vn-rose', nom: 'Grand vin — Rosé', prix: 20.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'vn-blanc', nom: 'Grand vin — Vin blanc', prix: 20.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'vn-chardonnay', nom: 'Chardonnay', prix: 20.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'vn-clairette', nom: 'Clairette de Die', prix: 25.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'sp-baileys', nom: 'Baileys', prix: 30.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'sp-ballantines', nom: 'Ballantine', prix: 60.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'ch-feuillatte', nom: 'Champagne Nicolas Feuillatte', prix: 60.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'sp-vodka', nom: 'Vodka', prix: 70.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'sp-chivas18', nom: 'Chivas 18 ans', prix: 90.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },
    { id: 'ch-veuve', nom: 'Champagne Veuve Clicquot', prix: 100.00, categorie: 'Vins, Champagnes & Bouteilles', eligibleFormule: false },

    // Plats & Grillades
    { id: 'pl-poisson', nom: 'Poisson', prix: 15.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-mouton', nom: 'Mouton', prix: 15.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-aile-simple', nom: 'Aile (simple)', prix: 10.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-aile-plantain', nom: 'Aile avec accompagnement banane plantain', prix: 12.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-aile-attieke', nom: 'Aile avec attiéké', prix: 15.00, categorie: 'Plats & Grillades', eligibleFormule: false },

    // Accompagnements
    { id: 'ac-attieke', nom: "1 boule d'attiéké", prix: 5.00, categorie: 'Accompagnements', eligibleFormule: false },
    { id: 'ac-plantain', nom: 'Banane plantain', prix: 2.50, categorie: 'Accompagnements', eligibleFormule: false },
    { id: 'ac-manioc', nom: 'Manioc', prix: 1.50, categorie: 'Accompagnements', eligibleFormule: false }
  ];

  function creerSalleInitiale() {
    const emplacements = [];
    for (let i = 1; i <= 16; i++) {
      emplacements.push({ id: 'table-' + i, nom: 'Table ' + i, type: 'table' });
    }
    for (let j = 1; j <= 4; j++) {
      emplacements.push({ id: 'comptoir-' + j, nom: 'Comptoir ' + j, type: 'comptoir' });
    }
    return emplacements;
  }

  /* ------------------------------------------------------------------------
     2. ÉTAT DE L'APPLICATION ET PERSISTANCE LOCALSTORAGE
     ------------------------------------------------------------------------ */
  let catalogue = chargerDepuisStockage(CLES_STOCKAGE.CATALOGUE, CATALOGUE_INITIAL);
  let salle = chargerDepuisStockage(CLES_STOCKAGE.SALLE, creerSalleInitiale());
  let commandes = chargerDepuisStockage(CLES_STOCKAGE.COMMANDES, {});
  let historique = chargerDepuisStockage(CLES_STOCKAGE.HISTORIQUE, []);
  let compteurRef = chargerDepuisStockage(CLES_STOCKAGE.COMPTEUR_REF, 101);

  let emplacementActifId = salle.length > 0 ? salle[0].id : null;
  let filtreSalleActif = 'tous';
  let categorieCarteActive = 'Toutes les catégories';
  let selectionFormuleEnCours = {}; // { produitId: quantite }

  function chargerDepuisStockage(cle, valeurParDefaut) {
    try {
      const brut = localStorage.getItem(cle);
      if (!brut) {
        localStorage.setItem(cle, JSON.stringify(valeurParDefaut));
        return JSON.parse(JSON.stringify(valeurParDefaut));
      }
      return JSON.parse(brut);
    } catch (e) {
      return JSON.parse(JSON.stringify(valeurParDefaut));
    }
  }

  function sauvegarderTout() {
    try {
      localStorage.setItem(CLES_STOCKAGE.CATALOGUE, JSON.stringify(catalogue));
      localStorage.setItem(CLES_STOCKAGE.SALLE, JSON.stringify(salle));
      localStorage.setItem(CLES_STOCKAGE.COMMANDES, JSON.stringify(commandes));
      localStorage.setItem(CLES_STOCKAGE.HISTORIQUE, JSON.stringify(historique));
      localStorage.setItem(CLES_STOCKAGE.COMPTEUR_REF, JSON.stringify(compteurRef));
    } catch (e) {
      afficherBandeauAlerte('Sauvegarde locale indisponible.', 'Vérifiez l’espace disponible sur la tablette.');
    }
  }

  /* ------------------------------------------------------------------------
     3. UTILITAIRES DE FORMATAGE (MONNAIE, HEURE, RÉFÉRENCES)
     ------------------------------------------------------------------------ */
  function formaterEuros(montant) {
    return Number(montant || 0).toFixed(2).replace('.', ',') + ' €';
  }

  function obtenirHeureCourante() {
    const maintenant = new Date();
    const h = String(maintenant.getHours()).padStart(2, '0');
    const m = String(maintenant.getMinutes()).padStart(2, '0');
    return h + ' h ' + m;
  }

  function genererReferenceTicket() {
    const ref = 'ESC-' + compteurRef;
    compteurRef += 1;
    sauvegarderTout();
    return ref;
  }

  function obtenirOuCreerCommande(emplacementId) {
    if (!commandes[emplacementId]) {
      commandes[emplacementId] = {
        reference: genererReferenceTicket(),
        statut: 'libre', // 'libre' | 'occupee' | 'attente_paiement'
        heureOuverture: null,
        heureStatut: null,
        modeService: 'Sur place', // 'Sur place' | 'À emporter'
        lignes: [] // { ligneId, produitId, nom, prixUnitaire, quantite, detail }
      };
    }
    return commandes[emplacementId];
  }

  function calculerTotalCommande(cmd) {
    if (!cmd || !cmd.lignes) return 0;
    return cmd.lignes.reduce(function (acc, l) {
      return acc + (l.prixUnitaire * l.quantite);
    }, 0);
  }

  function compterArticlesCommande(cmd) {
    if (!cmd || !cmd.lignes) return 0;
    return cmd.lignes.reduce(function (acc, l) {
      return acc + l.quantite;
    }, 0);
  }

  /* ------------------------------------------------------------------------
     4. NAVIGATION ENTRE LES 3 ÉCRANS
     ------------------------------------------------------------------------ */
  const vueSalle = document.getElementById('vue-salle');
  const vueCommande = document.getElementById('vue-commande');
  const vueAdmin = document.getElementById('vue-admin');

  const navBtnSalle = document.getElementById('nav-btn-salle');
  const navBtnCommande = document.getElementById('nav-btn-commande');
  const navBtnAdmin = document.getElementById('nav-btn-admin');

  function afficherVue(nomVue) {
    cacherBandeauAlerte();
    vueSalle.hidden = (nomVue !== 'salle');
    vueCommande.hidden = (nomVue !== 'commande');
    vueAdmin.hidden = (nomVue !== 'admin');

    navBtnSalle.classList.toggle('est-actif', nomVue === 'salle');
    navBtnCommande.classList.toggle('est-actif', nomVue === 'commande');
    navBtnAdmin.classList.toggle('est-actif', nomVue === 'admin');

    if (nomVue === 'salle') {
      rendreVueSalle();
    } else if (nomVue === 'commande') {
      if (!emplacementActifId && salle.length > 0) {
        emplacementActifId = salle[0].id;
      }
      rendreVueCommande();
    } else if (nomVue === 'admin') {
      rendreVueAdmin();
    }
  }

  navBtnSalle.addEventListener('click', function () { afficherVue('salle'); });
  navBtnCommande.addEventListener('click', function () { afficherVue('commande'); });
  navBtnAdmin.addEventListener('click', function () { afficherVue('admin'); });

  document.getElementById('btn-retour-salle').addEventListener('click', function () {
    afficherVue('salle');
  });
  document.getElementById('btn-admin-retour-salle').addEventListener('click', function () {
    afficherVue('salle');
  });

  /* ------------------------------------------------------------------------
     5. COMPOSANTS D'ALERTE (BANDEAU 6.1), MESSAGES (6.6) & CONFIRMATION
     ------------------------------------------------------------------------ */
  const bandeauGlobal = document.getElementById('bandeau-global');
  const bandeauFait = document.getElementById('bandeau-fait');
  const bandeauPrecision = document.getElementById('bandeau-precision');
  const bandeauActionLien = document.getElementById('bandeau-action-lien');

  function afficherBandeauAlerte(fait, precision, libelleAction, callbackAction) {
    bandeauFait.textContent = fait + ' ';
    bandeauPrecision.textContent = precision || '';
    if (libelleAction && typeof callbackAction === 'function') {
      bandeauActionLien.textContent = libelleAction;
      bandeauActionLien.hidden = false;
      bandeauActionLien.onclick = function () {
        cacherBandeauAlerte();
        callbackAction();
      };
    } else {
      bandeauActionLien.hidden = true;
      bandeauActionLien.onclick = null;
    }
    bandeauGlobal.hidden = false;
    bandeauGlobal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function cacherBandeauAlerte() {
    bandeauGlobal.hidden = true;
  }

  document.getElementById('bandeau-fermer').addEventListener('click', cacherBandeauAlerte);

  function afficherMessageTemporaire(texte, ton, callbackAnnuler) {
    const zone = document.getElementById('zone-messages');
    while (zone.children.length >= 3) {
      zone.removeChild(zone.firstChild);
    }

    const msg = document.createElement('div');
    msg.className = 'message-temporaire message-temporaire--' + (ton || 'info');

    const spanTexte = document.createElement('span');
    spanTexte.textContent = texte;
    msg.appendChild(spanTexte);

    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '8px';

    if (typeof callbackAnnuler === 'function') {
      const btnAnnuler = document.createElement('button');
      btnAnnuler.type = 'button';
      btnAnnuler.className = 'btn-message-action';
      btnAnnuler.textContent = 'Annuler';
      btnAnnuler.addEventListener('click', function () {
        callbackAnnuler();
        if (msg.parentNode) msg.parentNode.removeChild(msg);
      });
      actionsDiv.appendChild(btnAnnuler);
    }

    const btnFermer = document.createElement('button');
    btnFermer.type = 'button';
    btnFermer.className = 'btn-message-action';
    btnFermer.textContent = 'Fermer';
    btnFermer.addEventListener('click', function () {
      if (msg.parentNode) msg.parentNode.removeChild(msg);
    });
    actionsDiv.appendChild(btnFermer);

    msg.appendChild(actionsDiv);
    zone.appendChild(msg);

    if (ton !== 'erreur') {
      setTimeout(function () {
        if (msg.parentNode) msg.parentNode.removeChild(msg);
      }, 5000);
    }
  }

  // Fenêtre de confirmation (Composant 6.6 : verbes explicites, focus sur le bouton sûr)
  const modaleConfirmation = document.getElementById('modale-confirmation');
  const titreConfirmation = document.getElementById('titre-modale-confirmation');
  const texteConfirmation = document.getElementById('texte-modale-confirmation');
  const btnConfirmationGarder = document.getElementById('btn-confirmation-garder');
  const btnConfirmationDetruire = document.getElementById('btn-confirmation-detruire');

  function demanderConfirmation(options) {
    titreConfirmation.textContent = options.titre;
    texteConfirmation.textContent = options.consequences;
    btnConfirmationGarder.textContent = options.verbeGarder;
    btnConfirmationDetruire.textContent = options.verbeDetruire;

    modaleConfirmation.hidden = false;
    // Le focus part sur le bouton qui ne détruit rien (règle 6.6)
    btnConfirmationGarder.focus();

    btnConfirmationGarder.onclick = function () {
      modaleConfirmation.hidden = true;
    };

    btnConfirmationDetruire.onclick = function () {
      modaleConfirmation.hidden = true;
      if (typeof options.actionConfirmee === 'function') {
        options.actionConfirmee();
      }
    };
  }

  /* ------------------------------------------------------------------------
     6. RENDU DE LA VUE 1 : ÉTAT DE LA SALLE (REGISTRE)
     ------------------------------------------------------------------------ */
  function obtenirStatutLisible(cmd) {
    if (!cmd || cmd.lignes.length === 0 || cmd.statut === 'libre') {
      return {
        mot: 'Libre',
        classeTon: 'statut-mot--neutre',
        repereTemps: 'Aucun ticket ouvert'
      };
    }
    if (cmd.statut === 'attente_paiement') {
      return {
        mot: 'En attente d’encaissement',
        classeTon: 'statut-mot--alerte',
        repereTemps: 'depuis ' + (cmd.heureStatut || cmd.heureOuverture || obtenirHeureCourante()) + ' (' + cmd.modeService + ')'
      };
    }
    return {
      mot: 'Occupée',
      classeTon: 'statut-mot--attente',
      repereTemps: 'depuis ' + (cmd.heureOuverture || obtenirHeureCourante()) + ' (' + cmd.modeService + ')'
    };
  }

  function rendreVueSalle() {
    const listeEl = document.getElementById('liste-emplacements-salle');
    listeEl.innerHTML = '';

    let nbOccupes = 0;
    let totalEnCours = 0;

    salle.forEach(function (emp) {
      const cmd = commandes[emp.id];
      const total = calculerTotalCommande(cmd);
      const estActif = cmd && cmd.lignes && cmd.lignes.length > 0;
      if (estActif) {
        nbOccupes += 1;
        totalEnCours += total;
      }
    });

    const totalEncaisseSoir = historique.reduce(function (acc, h) {
      return acc + h.montant;
    }, 0);

    document.getElementById('stat-occupes').textContent = nbOccupes + ' sur ' + salle.length;
    document.getElementById('stat-en-cours').textContent = formaterEuros(totalEnCours);
    document.getElementById('stat-encaisse').textContent = formaterEuros(totalEncaisseSoir);

    const emplacementsFiltres = salle.filter(function (emp) {
      const cmd = commandes[emp.id];
      const estOccupe = cmd && cmd.lignes && cmd.lignes.length > 0;
      if (filtreSalleActif === 'occupees') return estOccupe;
      if (filtreSalleActif === 'tables') return emp.type === 'table';
      if (filtreSalleActif === 'comptoir') return emp.type === 'comptoir';
      return true;
    });

    if (emplacementsFiltres.length === 0) {
      const liVide = document.createElement('li');
      liVide.style.padding = '24px';
      liVide.innerHTML =
        '<p class="titre-bloc">Aucun emplacement dans cette vue</p>' +
        '<p class="texte-secondaire" style="margin-top:4px;">Affichez tous les emplacements pour ouvrir une nouvelle table.</p>';
      listeEl.appendChild(liVide);
      return;
    }

    // La première ligne occupée reçoit un accent visuel subtil
    emplacementsFiltres.forEach(function (emp) {
      const cmd = obtenirOuCreerCommande(emp.id);
      const statutInfo = obtenirStatutLisible(cmd);
      const total = calculerTotalCommande(cmd);
      const nbArticles = compterArticlesCommande(cmd);
      const estOccupe = nbArticles > 0;

      const li = document.createElement('li');
      li.className = 'ligne-registre' + (estOccupe ? ' ligne-registre--active' : '');

      const divNom = document.createElement('div');
      divNom.className = 'cellule-nom';
      divNom.textContent = emp.nom;

      const divStatut = document.createElement('div');
      divStatut.className = 'statut-ligne';
      const spanMot = document.createElement('span');
      spanMot.className = 'statut-mot ' + statutInfo.classeTon;
      spanMot.textContent = statutInfo.mot;
      const spanTemps = document.createElement('span');
      spanTemps.className = 'statut-temps';
      spanTemps.textContent = statutInfo.repereTemps;
      divStatut.appendChild(spanMot);
      divStatut.appendChild(spanTemps);

      const divApercu = document.createElement('div');
      divApercu.className = 'cellule-apercu';
      if (estOccupe) {
        const resumePlats = cmd.lignes.map(function (l) {
          return l.quantite + 'x ' + l.nom;
        }).join(', ');
        divApercu.textContent = cmd.reference + ' — ' + resumePlats;
      } else {
        divApercu.textContent = 'Prête à accueillir des clients';
      }

      const divMontant = document.createElement('div');
      divMontant.className = 'cellule-montant';
      divMontant.textContent = formaterEuros(total);

      const divAction = document.createElement('div');
      divAction.className = 'cellule-action';
      const btnOuvrir = document.createElement('button');
      btnOuvrir.type = 'button';
      btnOuvrir.className = estOccupe ? 'btn btn--principal' : 'btn btn--secondaire';
      btnOuvrir.textContent = estOccupe ? 'Reprendre le ticket' : 'Ouvrir la table';
      btnOuvrir.addEventListener('click', function () {
        emplacementActifId = emp.id;
        afficherVue('commande');
      });
      divAction.appendChild(btnOuvrir);

      li.appendChild(divNom);
      li.appendChild(divStatut);
      li.appendChild(divApercu);
      li.appendChild(divMontant);
      li.appendChild(divAction);
      listeEl.appendChild(li);
    });
  }

  // Filtres de salle
  document.querySelectorAll('[data-filtre-salle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtreSalleActif = btn.getAttribute('data-filtre-salle');
      document.querySelectorAll('[data-filtre-salle]').forEach(function (b) {
        b.classList.toggle('est-actif', b === btn);
      });
      rendreVueSalle();
    });
  });

  /* ------------------------------------------------------------------------
     7. RENDU DE LA VUE 2 : PRISE DE COMMANDE ET TICKET DE CAISSE
     ------------------------------------------------------------------------ */
  function rendreVueCommande() {
    // 1. Sélecteur rapide d'emplacement
    const selecteur = document.getElementById('selecteur-table-rapide');
    selecteur.innerHTML = '';
    salle.forEach(function (emp) {
      const opt = document.createElement('option');
      opt.value = emp.id;
      const cmd = commandes[emp.id];
      const total = calculerTotalCommande(cmd);
      opt.textContent = emp.nom + (total > 0 ? ' (' + formaterEuros(total) + ')' : ' (Libre)');
      if (emp.id === emplacementActifId) opt.selected = true;
      selecteur.appendChild(opt);
    });

    rendreOngletsCategories();
    rendreListeProduitsCarte();
    rendreTicketActif();
  }

  document.getElementById('selecteur-table-rapide').addEventListener('change', function (e) {
    emplacementActifId = e.target.value;
    rendreVueCommande();
  });

  function obtenirCategoriesUniques() {
    const cats = ['Toutes les catégories'];
    catalogue.forEach(function (item) {
      if (cats.indexOf(item.categorie) === -1) {
        cats.push(item.categorie);
      }
    });
    return cats;
  }

  function rendreOngletsCategories() {
    const barre = document.getElementById('barre-categories-carte');
    barre.innerHTML = '';
    const categories = obtenirCategoriesUniques();

    categories.forEach(function (cat) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--secondaire' + (cat === categorieCarteActive ? ' est-actif' : '');
      btn.textContent = cat;
      btn.addEventListener('click', function () {
        categorieCarteActive = cat;
        document.getElementById('titre-categorie-active').textContent = cat;
        rendreOngletsCategories();
        rendreListeProduitsCarte();
      });
      barre.appendChild(btn);
    });
  }

  function rendreListeProduitsCarte() {
    const conteneur = document.getElementById('liste-produits-carte');
    conteneur.innerHTML = '';

    const produitsFiltres = catalogue.filter(function (p) {
      if (categorieCarteActive === 'Toutes les catégories') return true;
      return p.categorie === categorieCarteActive;
    });

    if (produitsFiltres.length === 0) {
      conteneur.innerHTML =
        '<div style="padding:24px;">' +
        '<p class="titre-bloc">Aucun produit dans cette catégorie</p>' +
        '<p class="texte-secondaire">Ajoutez vos nouveaux produits depuis l’écran Gérer la carte et la salle.</p>' +
        '</div>';
      return;
    }

    produitsFiltres.forEach(function (produit) {
      const btnLigne = document.createElement('button');
      btnLigne.type = 'button';
      btnLigne.className = 'ligne-produit-carte';

      const divInfos = document.createElement('div');
      divInfos.className = 'produit-infos';
      const spanNom = document.createElement('span');
      spanNom.className = 'produit-nom';
      spanNom.textContent = produit.nom;
      const spanPrecision = document.createElement('span');
      spanPrecision.className = 'produit-precision';
      spanPrecision.textContent = produit.categorie + (produit.eligibleFormule ? ' — Éligible Formule 4 boissons à 10 €' : '');
      divInfos.appendChild(spanNom);
      divInfos.appendChild(spanPrecision);

      const divDroite = document.createElement('div');
      divDroite.className = 'produit-droite';
      const spanPrix = document.createElement('span');
      spanPrix.className = 'produit-prix';
      spanPrix.textContent = formaterEuros(produit.prix);
      const spanAction = document.createElement('span');
      spanAction.className = 'produit-action-mot';
      spanAction.textContent = 'Ajouter au ticket';
      divDroite.appendChild(spanPrix);
      divDroite.appendChild(spanAction);

      btnLigne.appendChild(divInfos);
      btnLigne.appendChild(divDroite);

      btnLigne.addEventListener('click', function () {
        ajouterProduitAuTicket(produit);
      });

      conteneur.appendChild(btnLigne);
    });
  }

  function ajouterProduitAuTicket(produit, detailPersonnalise) {
    if (!emplacementActifId) return;
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    const maintenant = obtenirHeureCourante();

    if (cmd.lignes.length === 0 || !cmd.heureOuverture) {
      cmd.heureOuverture = maintenant;
    }
    cmd.statut = 'occupee';
    cmd.heureStatut = maintenant;

    // Si ce n'est pas une formule personnalisée, on regroupe les lignes identiques
    if (!detailPersonnalise) {
      const existante = cmd.lignes.find(function (l) {
        return l.produitId === produit.id && !l.detail;
      });
      if (existante) {
        existante.quantite += 1;
        sauvegarderTout();
        rendreVueCommande();
        return;
      }
    }

    cmd.lignes.push({
      ligneId: 'lig-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      produitId: produit.id,
      nom: produit.nom,
      prixUnitaire: Number(produit.prix),
      quantite: 1,
      detail: detailPersonnalise || ''
    });

    sauvegarderTout();
    rendreVueCommande();
  }

  function modifierQuantiteLigne(ligneId, delta) {
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    const idx = cmd.lignes.findIndex(function (l) { return l.ligneId === ligneId; });
    if (idx === -1) return;

    cmd.lignes[idx].quantite += delta;
    if (cmd.lignes[idx].quantite <= 0) {
      cmd.lignes.splice(idx, 1);
    }

    if (cmd.lignes.length === 0) {
      cmd.statut = 'libre';
      cmd.heureOuverture = null;
      cmd.heureStatut = null;
    }

    sauvegarderTout();
    rendreVueCommande();
  }

  function rendreTicketActif() {
    const emp = salle.find(function (e) { return e.id === emplacementActifId; });
    if (!emp) return;

    const cmd = obtenirOuCreerCommande(emp.id);
    const statutInfo = obtenirStatutLisible(cmd);

    document.getElementById('ticket-reference').textContent = cmd.reference;
    document.getElementById('ticket-nom-emplacement').textContent = emp.nom;
    document.getElementById('ticket-statut-texte').textContent = statutInfo.mot;
    document.getElementById('ticket-statut-heure').textContent = statutInfo.repereTemps;

    // Mode de service Sur place / À emporter
    const btnSurPlace = document.getElementById('btn-mode-sur-place');
    const btnEmporter = document.getElementById('btn-mode-emporter');
    btnSurPlace.setAttribute('aria-pressed', cmd.modeService === 'Sur place' ? 'true' : 'false');
    btnEmporter.setAttribute('aria-pressed', cmd.modeService === 'À emporter' ? 'true' : 'false');

    const listeLignesEl = document.getElementById('ticket-liste-lignes');
    listeLignesEl.innerHTML = '';

    if (cmd.lignes.length === 0) {
      listeLignesEl.innerHTML =
        '<li class="etat-vide-ticket">' +
        '<p class="etat-vide-titre">Aucune consommation enregistrée</p>' +
        '<p class="etat-vide-texte">Touchez un plat ou une boisson dans la liste de gauche pour ouvrir le ticket de ' + emp.nom + '.</p>' +
        '</li>';
    } else {
      cmd.lignes.forEach(function (ligne) {
        const li = document.createElement('li');
        li.className = 'ticket-ligne';

        const divPrincipale = document.createElement('div');
        divPrincipale.className = 'ticket-ligne-principale';

        const spanQte = document.createElement('span');
        spanQte.className = 'ticket-qte';
        spanQte.textContent = ligne.quantite + 'x';

        const spanNom = document.createElement('span');
        spanNom.className = 'ticket-designation';
        spanNom.textContent = ligne.nom;

        const spanMontant = document.createElement('span');
        spanMontant.className = 'ticket-montant';
        spanMontant.textContent = formaterEuros(ligne.prixUnitaire * ligne.quantite);

        divPrincipale.appendChild(spanQte);
        divPrincipale.appendChild(spanNom);
        divPrincipale.appendChild(spanMontant);
        li.appendChild(divPrincipale);

        if (ligne.detail) {
          const pDetail = document.createElement('p');
          pDetail.className = 'ticket-detail-formule';
          pDetail.textContent = ligne.detail;
          li.appendChild(pDetail);
        }

        const divControles = document.createElement('div');
        divControles.className = 'ticket-controles-ligne';

        const btnMoins = document.createElement('button');
        btnMoins.type = 'button';
        btnMoins.className = 'btn-qte-ticket';
        btnMoins.setAttribute('aria-label', 'Retirer une unité de ' + ligne.nom);
        btnMoins.textContent = '- 1';
        btnMoins.addEventListener('click', function () {
          modifierQuantiteLigne(ligne.ligneId, -1);
        });

        const btnPlus = document.createElement('button');
        btnPlus.type = 'button';
        btnPlus.className = 'btn-qte-ticket';
        btnPlus.setAttribute('aria-label', 'Ajouter une unité de ' + ligne.nom);
        btnPlus.textContent = '+ 1';
        btnPlus.addEventListener('click', function () {
          modifierQuantiteLigne(ligne.ligneId, 1);
        });

        const btnSuppr = document.createElement('button');
        btnSuppr.type = 'button';
        btnSuppr.className = 'btn-retirer-ligne';
        btnSuppr.textContent = 'Retirer la ligne';
        btnSuppr.addEventListener('click', function () {
          modifierQuantiteLigne(ligne.ligneId, -ligne.quantite);
        });

        divControles.appendChild(btnMoins);
        divControles.appendChild(btnPlus);
        divControles.appendChild(btnSuppr);
        li.appendChild(divControles);

        listeLignesEl.appendChild(li);
      });
    }

    const nbArticles = compterArticlesCommande(cmd);
    const total = calculerTotalCommande(cmd);

    document.getElementById('ticket-nb-articles').textContent =
      nbArticles + (nbArticles > 1 ? ' articles' : ' article');
    document.getElementById('ticket-montant-total').textContent = formaterEuros(total);

    document.getElementById('btn-encaisser-ticket').disabled = (nbArticles === 0);
    document.getElementById('btn-marquer-attente').disabled = (nbArticles === 0);
    document.getElementById('btn-vider-ticket').disabled = (nbArticles === 0);
  }

  // Changement de mode Sur place / À emporter
  document.getElementById('btn-mode-sur-place').addEventListener('click', function () {
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    cmd.modeService = 'Sur place';
    sauvegarderTout();
    rendreTicketActif();
  });

  document.getElementById('btn-mode-emporter').addEventListener('click', function () {
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    cmd.modeService = 'À emporter';
    sauvegarderTout();
    rendreTicketActif();
  });

  // Marquer en attente de paiement
  document.getElementById('btn-marquer-attente').addEventListener('click', function () {
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    if (cmd.lignes.length === 0) return;
    cmd.statut = 'attente_paiement';
    cmd.heureStatut = obtenirHeureCourante();
    sauvegarderTout();
    rendreTicketActif();
    afficherMessageTemporaire('Ticket marqué en attente de paiement.', 'info');
  });

  // Vider le ticket (avec fenêtre de confirmation)
  document.getElementById('btn-vider-ticket').addEventListener('click', function () {
    const emp = salle.find(function (e) { return e.id === emplacementActifId; });
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    if (cmd.lignes.length === 0) return;

    demanderConfirmation({
      titre: 'Vider le ticket de ' + (emp ? emp.nom : 'cet emplacement') + ' ?',
      consequences: 'Toutes les lignes de ce ticket (' + formaterEuros(calculerTotalCommande(cmd)) + ') seront supprimées sans être comptabilisées dans la recette de la soirée.',
      verbeGarder: 'Garder le ticket',
      verbeDetruire: 'Vider le ticket',
      actionConfirmee: function () {
        commandes[emplacementActifId] = {
          reference: genererReferenceTicket(),
          statut: 'libre',
          heureOuverture: null,
          heureStatut: null,
          modeService: 'Sur place',
          lignes: []
        };
        sauvegarderTout();
        rendreVueCommande();
        afficherMessageTemporaire('Ticket vidé.', 'info');
      }
    });
  });

  // Encaisser le ticket (Le même verbe du bouton au message de confirmation : "Encaisser le ticket" -> "Ticket encaissé")
  document.getElementById('btn-encaisser-ticket').addEventListener('click', function () {
    const emp = salle.find(function (e) { return e.id === emplacementActifId; });
    const cmd = obtenirOuCreerCommande(emplacementActifId);
    if (cmd.lignes.length === 0) return;

    const montantRegle = calculerTotalCommande(cmd);
    const archive = {
      id: 'enc-' + Date.now(),
      reference: cmd.reference,
      emplacementNom: emp ? emp.nom : emplacementActifId,
      modeService: cmd.modeService,
      heureEncaissement: obtenirHeureCourante(),
      montant: montantRegle,
      resume: cmd.lignes.map(function (l) { return l.quantite + 'x ' + l.nom; }).join(', ')
    };

    historique.unshift(archive);

    // Réinitialisation de la table
    commandes[emplacementActifId] = {
      reference: genererReferenceTicket(),
      statut: 'libre',
      heureOuverture: null,
      heureStatut: null,
      modeService: 'Sur place',
      lignes: []
    };

    sauvegarderTout();
    rendreVueCommande();
    afficherMessageTemporaire(
      'Ticket encaissé (' + formaterEuros(montantRegle) + ' — ' + archive.emplacementNom + ').',
      'succes'
    );
  });

  /* ------------------------------------------------------------------------
     8. MODALE FORMULE 4 BOISSONS À 10,00 € (PANACHAGE BIÈRES 3 € & JUS 2 €)
     ------------------------------------------------------------------------ */
  const modaleFormule = document.getElementById('modale-formule');
  const listeEligiblesEl = document.getElementById('liste-boissons-eligibles-formule');
  const compteurFormuleEl = document.getElementById('compteur-boissons-formule');
  const btnValiderFormule = document.getElementById('btn-valider-formule');

  function compterTotalBoissonsFormule() {
    return Object.keys(selectionFormuleEnCours).reduce(function (acc, id) {
      return acc + (selectionFormuleEnCours[id] || 0);
    }, 0);
  }

  function ouvrirModaleFormule() {
    selectionFormuleEnCours = {};
    rendreInterieurModaleFormule();
    modaleFormule.hidden = false;
  }

  function rendreInterieurModaleFormule() {
    listeEligiblesEl.innerHTML = '';
    const boissonsEligibles = catalogue.filter(function (p) { return p.eligibleFormule; });
    const totalChoisi = compterTotalBoissonsFormule();

    compteurFormuleEl.textContent = totalChoisi + ' sur 4';
    btnValiderFormule.disabled = (totalChoisi !== 4);

    boissonsEligibles.forEach(function (boisson) {
      const qte = selectionFormuleEnCours[boisson.id] || 0;
      const div = document.createElement('div');
      div.className = 'ligne-choix-boisson';

      const divTexte = document.createElement('div');
      divTexte.innerHTML =
        '<span class="produit-nom">' + boisson.nom + '</span> ' +
        '<span class="texte-secondaire">(' + formaterEuros(boisson.prix) + ' hors formule)</span>';

      const divControles = document.createElement('div');
      divControles.className = 'controles-choix-boisson';

      const btnMoins = document.createElement('button');
      btnMoins.type = 'button';
      btnMoins.className = 'btn btn--secondaire';
      btnMoins.textContent = '- 1';
      btnMoins.disabled = (qte <= 0);
      btnMoins.addEventListener('click', function () {
        if (selectionFormuleEnCours[boisson.id] > 0) {
          selectionFormuleEnCours[boisson.id] -= 1;
          rendreInterieurModaleFormule();
        }
      });

      const spanQte = document.createElement('span');
      spanQte.className = 'reference';
      spanQte.style.minWidth = '28px';
      spanQte.style.textAlign = 'center';
      spanQte.textContent = String(qte);

      const btnPlus = document.createElement('button');
      btnPlus.type = 'button';
      btnPlus.className = 'btn btn--secondaire';
      btnPlus.textContent = '+ 1';
      btnPlus.disabled = (totalChoisi >= 4);
      btnPlus.addEventListener('click', function () {
        if (compterTotalBoissonsFormule() < 4) {
          selectionFormuleEnCours[boisson.id] = (selectionFormuleEnCours[boisson.id] || 0) + 1;
          rendreInterieurModaleFormule();
        }
      });

      divControles.appendChild(btnMoins);
      divControles.appendChild(spanQte);
      divControles.appendChild(btnPlus);

      div.appendChild(divTexte);
      div.appendChild(divControles);
      listeEligiblesEl.appendChild(div);
    });
  }

  document.getElementById('btn-ouvrir-formule-direct').addEventListener('click', ouvrirModaleFormule);
  document.getElementById('btn-annuler-formule').addEventListener('click', function () {
    modaleFormule.hidden = true;
  });

  btnValiderFormule.addEventListener('click', function () {
    if (compterTotalBoissonsFormule() !== 4) return;
    const details = [];
    Object.keys(selectionFormuleEnCours).forEach(function (id) {
      const qte = selectionFormuleEnCours[id];
      if (qte > 0) {
        const prod = catalogue.find(function (p) { return p.id === id; });
        if (prod) details.push(qte + 'x ' + prod.nom);
      }
    });

    ajouterProduitAuTicket(
      {
        id: 'formule-4-boissons',
        nom: 'Formule 4 Boissons',
        prix: 10.00
      },
      'Détail : ' + details.join(', ')
    );

    modaleFormule.hidden = true;
    afficherMessageTemporaire('Formule 4 Boissons ajoutée au ticket.', 'succes');
  });

  /* ------------------------------------------------------------------------
     9. RENDU ET LOGIQUE DE LA VUE 3 : ADMINISTRATION (CARTE, SALLE, JOURNAL)
     ------------------------------------------------------------------------ */
  function rendreVueAdmin() {
    rendreAdminCatalogue();
    rendreAdminSalle();
    rendreAdminHistorique();
  }

  function rendreAdminCatalogue() {
    const conteneur = document.getElementById('liste-admin-catalogue');
    conteneur.innerHTML = '';

    catalogue.forEach(function (item) {
      const ligne = document.createElement('div');
      ligne.className = 'ligne-admin-catalogue';

      const divInfos = document.createElement('div');
      divInfos.innerHTML =
        '<div class="cellule-nom">' + item.nom + '</div>' +
        '<div class="texte-secondaire">' + item.categorie +
        (item.eligibleFormule ? ' — Éligible Formule 10 €' : '') + '</div>';

      const divPrix = document.createElement('div');
      divPrix.className = 'groupe-prix-inline';
      const inputPrix = document.createElement('input');
      inputPrix.type = 'text';
      inputPrix.inputMode = 'decimal';
      inputPrix.className = 'champ-prix-inline';
      inputPrix.setAttribute('aria-label', 'Prix en euros pour ' + item.nom);
      inputPrix.value = Number(item.prix).toFixed(2).replace('.', ',');

      const btnSauverPrix = document.createElement('button');
      btnSauverPrix.type = 'button';
      btnSauverPrix.className = 'btn btn--secondaire';
      btnSauverPrix.textContent = 'Modifier le prix';
      btnSauverPrix.addEventListener('click', function () {
        const valNettoyee = parseFloat(inputPrix.value.replace(',', '.'));
        if (isNaN(valNettoyee) || valNettoyee <= 0) {
          afficherBandeauAlerte(
            'Prix invalide.',
            'Saisissez un montant supérieur à 0 € pour ' + item.nom + ' (exemple : 3,50).'
          );
          return;
        }
        item.prix = valNettoyee;
        sauvegarderTout();
        rendreAdminCatalogue();
        afficherMessageTemporaire('Prix modifié pour ' + item.nom + ' (' + formaterEuros(valNettoyee) + ').', 'succes');
      });

      divPrix.appendChild(inputPrix);
      divPrix.appendChild(btnSauverPrix);

      const btnToggleFormule = document.createElement('button');
      btnToggleFormule.type = 'button';
      btnToggleFormule.className = 'btn btn--discret';
      btnToggleFormule.textContent = item.eligibleFormule ? 'Retirer de la Formule 10 €' : 'Inclure dans Formule 10 €';
      btnToggleFormule.addEventListener('click', function () {
        item.eligibleFormule = !item.eligibleFormule;
        sauvegarderTout();
        rendreAdminCatalogue();
      });

      const btnRetirer = document.createElement('button');
      btnRetirer.type = 'button';
      btnRetirer.className = 'btn btn--danger';
      btnRetirer.textContent = 'Retirer de la carte';
      btnRetirer.addEventListener('click', function () {
        const copieItem = Object.assign({}, item);
        const indexOriginal = catalogue.findIndex(function (p) { return p.id === item.id; });
        catalogue = catalogue.filter(function (p) { return p.id !== item.id; });
        sauvegarderTout();
        rendreAdminCatalogue();

        afficherMessageTemporaire(
          'Produit retiré de la carte (' + copieItem.nom + ').',
          'info',
          function () {
            catalogue.splice(indexOriginal, 0, copieItem);
            sauvegarderTout();
            rendreAdminCatalogue();
          }
        );
      });

      ligne.appendChild(divInfos);
      ligne.appendChild(divPrix);
      ligne.appendChild(btnToggleFormule);
      ligne.appendChild(btnRetirer);
      conteneur.appendChild(ligne);
    });
  }

  // Formulaire d'ajout de produit (Validation conforme 6.3)
  document.getElementById('form-ajout-produit').addEventListener('submit', function (e) {
    e.preventDefault();
    const champNom = document.getElementById('champ-nom-produit');
    const champPrix = document.getElementById('champ-prix-produit');
    const champCategorie = document.getElementById('champ-categorie-produit');
    const champEligible = document.getElementById('champ-eligible-formule');

    const erreurNom = document.getElementById('erreur-nom-produit');
    const erreurPrix = document.getElementById('erreur-prix-produit');

    const nom = champNom.value.trim();
    const prixNum = parseFloat(champPrix.value.trim().replace(',', '.'));

    let erreur = false;
    if (!nom) {
      champNom.classList.add('en-erreur');
      erreurNom.hidden = false;
      erreur = true;
    } else {
      champNom.classList.remove('en-erreur');
      erreurNom.hidden = true;
    }

    if (isNaN(prixNum) || prixNum <= 0) {
      champPrix.classList.add('en-erreur');
      erreurPrix.hidden = false;
      erreur = true;
    } else {
      champPrix.classList.remove('en-erreur');
      erreurPrix.hidden = true;
    }

    if (erreur) return;

    const nouveauProduit = {
      id: 'prod-' + Date.now(),
      nom: nom,
      prix: prixNum,
      categorie: champCategorie.value,
      eligibleFormule: champEligible.checked
    };

    catalogue.unshift(nouveauProduit);
    sauvegarderTout();

    champNom.value = '';
    champPrix.value = '';
    champEligible.checked = false;

    rendreAdminCatalogue();
    afficherMessageTemporaire('Produit ajouté à la carte (' + nouveauProduit.nom + ').', 'succes');
  });

  // Gestion des emplacements de la salle (Tables & Comptoir)
  function rendreAdminSalle() {
    const listeEl = document.getElementById('liste-admin-salle');
    listeEl.innerHTML = '';

    salle.forEach(function (emp, index) {
      const cmd = commandes[emp.id];
      const statutInfo = obtenirStatutLisible(cmd);
      const nbArticles = compterArticlesCommande(cmd);

      const li = document.createElement('li');
      li.className = 'ligne-registre';
      li.style.gridTemplateColumns = '1.2fr 1.5fr auto';

      const divNom = document.createElement('div');
      divNom.className = 'cellule-nom';
      divNom.textContent = emp.nom;

      const divStatut = document.createElement('div');
      divStatut.className = 'statut-ligne';
      divStatut.innerHTML =
        '<span class="statut-mot ' + statutInfo.classeTon + '">' + statutInfo.mot + '</span> ' +
        '<span class="statut-temps">' + statutInfo.repereTemps + '</span>';

      const divAction = document.createElement('div');
      divAction.className = 'cellule-action';

      const btnSuppr = document.createElement('button');
      btnSuppr.type = 'button';
      btnSuppr.className = 'btn btn--danger';
      btnSuppr.textContent = 'Supprimer l’emplacement';
      btnSuppr.addEventListener('click', function () {
        if (nbArticles > 0) {
          afficherBandeauAlerte(
            'Suppression impossible.',
            emp.nom + ' possède un ticket actif (' + formaterEuros(calculerTotalCommande(cmd)) + '). Encaissez ou videz le ticket avant de supprimer cet emplacement.',
            'Ouvrir le ticket de ' + emp.nom,
            function () {
              emplacementActifId = emp.id;
              afficherVue('commande');
            }
          );
          return;
        }

        const copieEmp = Object.assign({}, emp);
        salle.splice(index, 1);
        if (emplacementActifId === emp.id) {
          emplacementActifId = salle.length > 0 ? salle[0].id : null;
        }
        sauvegarderTout();
        rendreAdminSalle();

        afficherMessageTemporaire(
          'Emplacement supprimé (' + copieEmp.nom + ').',
          'info',
          function () {
            salle.splice(index, 0, copieEmp);
            sauvegarderTout();
            rendreAdminSalle();
          }
        );
      });

      divAction.appendChild(btnSuppr);
      li.appendChild(divNom);
      li.appendChild(divStatut);
      li.appendChild(divAction);
      listeEl.appendChild(li);
    });
  }

  document.getElementById('btn-ajouter-table-auto').addEventListener('click', function () {
    const numSuivant = salle.filter(function (e) { return e.type === 'table'; }).length + 1;
    const nouvelEmp = {
      id: 'table-' + Date.now(),
      nom: 'Table ' + numSuivant,
      type: 'table'
    };
    salle.push(nouvelEmp);
    sauvegarderTout();
    rendreAdminSalle();
    afficherMessageTemporaire('Table ajoutée (' + nouvelEmp.nom + ').', 'succes');
  });

  document.getElementById('btn-ajouter-comptoir-auto').addEventListener('click', function () {
    const numSuivant = salle.filter(function (e) { return e.type === 'comptoir'; }).length + 1;
    const nouvelEmp = {
      id: 'comptoir-' + Date.now(),
      nom: 'Comptoir ' + numSuivant,
      type: 'comptoir'
    };
    salle.push(nouvelEmp);
    sauvegarderTout();
    rendreAdminSalle();
    afficherMessageTemporaire('Place au comptoir ajoutée (' + nouvelEmp.nom + ').', 'succes');
  });

  document.getElementById('form-ajout-emplacement-libre').addEventListener('submit', function (e) {
    e.preventDefault();
    const champ = document.getElementById('champ-nom-emplacement');
    const nom = champ.value.trim();
    if (!nom) return;

    const typeDetecte = nom.toLowerCase().indexOf('comptoir') !== -1 ? 'comptoir' : 'table';
    const nouvelEmp = {
      id: 'emp-' + Date.now(),
      nom: nom,
      type: typeDetecte
    };
    salle.push(nouvelEmp);
    champ.value = '';
    sauvegarderTout();
    rendreAdminSalle();
    afficherMessageTemporaire('Emplacement créé (' + nouvelEmp.nom + ').', 'succes');
  });

  // Historique des encaissements de la soirée
  function rendreAdminHistorique() {
    const listeEl = document.getElementById('liste-historique-encaissements');
    listeEl.innerHTML = '';

    if (historique.length === 0) {
      listeEl.innerHTML =
        '<li style="padding:24px;">' +
        '<p class="titre-bloc">Aucun ticket encaissé pour le moment</p>' +
        '<p class="texte-secondaire">Les règlements validés pendant la nuit s’afficheront ici avec leur heure et leur montant.</p>' +
        '</li>';
      return;
    }

    historique.forEach(function (h) {
      const li = document.createElement('li');
      li.className = 'ligne-registre';
      li.style.gridTemplateColumns = '110px 1fr 1.6fr auto';

      li.innerHTML =
        '<div class="reference">' + h.reference + '</div>' +
        '<div><span class="cellule-nom">' + h.emplacementNom + '</span> ' +
        '<span class="statut-temps">encaissé à ' + h.heureEncaissement + ' (' + h.modeService + ')</span></div>' +
        '<div class="cellule-apercu">' + h.resume + '</div>' +
        '<div class="cellule-montant">' + formaterEuros(h.montant) + '</div>';

      listeEl.appendChild(li);
    });
  }

  document.getElementById('btn-cloturer-soiree').addEventListener('click', function () {
    if (historique.length === 0) return;
    demanderConfirmation({
      titre: 'Effacer le journal des encaissements de la nuit ?',
      consequences: 'L’historique des tickets encaissés sera remis à zéro pour démarrer un nouveau service.',
      verbeGarder: 'Garder le journal',
      verbeDetruire: 'Effacer le journal',
      actionConfirmee: function () {
        historique = [];
        sauvegarderTout();
        rendreAdminHistorique();
        afficherMessageTemporaire('Journal de la soirée effacé.', 'info');
      }
    });
  });

  /* ------------------------------------------------------------------------
     10. ENREGISTREMENT DU SERVICE WORKER (PWA HORS-LIGNE) & DÉMARRAGE
     ------------------------------------------------------------------------ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {
        // Fonctionne même sans HTTPS en ouverture locale
      });
    });
  }

  // Initialisation au premier affichage
  rendreVueSalle();
})();
