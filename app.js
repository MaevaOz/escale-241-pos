/* ==========================================================================
   L'ESCALE 241 — CAISSE HORS-LIGNE, SERVICES ET RECAP DES VENTES (app.js)
   Version 2. Tout est enregistré dans la tablette (localStorage) :
   - escale_catalogue_v1 : carte (boissons, plats, accompagnements)
   - escale_salle_v1     : tables et places au comptoir
   - escale_commandes_v2 : tickets en cours, par emplacement
   - escale_tickets_v2   : tickets terminés (encaissés ou annulés), tous services
   - escale_services_v2  : services (ouverture, clôture)
   - escale_payees_v2    : tables payées dont les clients sont peut-être encore là
   - escale_reglages_v2  : réglages (prix de la formule)
   Les anciennes données (v1) sont reprises automatiquement et laissées intactes.
   Tous les montants des tickets sont calculés en centimes.
   ========================================================================== */

(function () {
  'use strict';

  const CLES = {
    CATALOGUE: 'escale_catalogue_v1',
    SALLE: 'escale_salle_v1',
    COMPTEUR_REF: 'escale_compteur_ref_v1',
    COMMANDES: 'escale_commandes_v2',
    TICKETS: 'escale_tickets_v2',
    SERVICES: 'escale_services_v2',
    PAYEES: 'escale_payees_v2',
    REGLAGES: 'escale_reglages_v2'
  };
  const CLE_VERSION = 'escale_version_donnees';
  const CLE_SAUVEGARDE_AUTO = 'escale_sauvegarde_auto';
  const ANCIENNES = {
    COMMANDES: 'escale_commandes_v1',
    HISTORIQUE: 'escale_historique_v1',
    PAYEES: 'escale_payees_v1'
  };

  /* ------------------------------------------------------------------------
     1. DONNÉES INITIALES
     ------------------------------------------------------------------------ */
  const CATALOGUE_INITIAL = [
    { id: 'b-leffe', nom: 'Bière Leffe', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-despe', nom: 'Bière Desperados', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-heineken', nom: 'Bière Heineken', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-guinness', nom: 'Bière Guinness', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-autre', nom: 'Bière 3 € (autre référence)', prix: 3.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-coca', nom: 'Coca-Cola', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-fanta', nom: 'Fanta', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-orangina', nom: 'Orangina', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-redbull', nom: 'RedBull', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-sprite', nom: 'Sprite', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'j-caraibos', nom: 'Caraïbos Litchi', prix: 2.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: true },
    { id: 'b-eau', nom: 'Eau', prix: 1.00, categorie: 'Bières & Jus (Éligibles Formule)', eligibleFormule: false },
    { id: 'ba-regab', nom: 'Regab', prix: 6.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ba-beaufort', nom: 'Beaufort', prix: 4.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-whisky-cola', nom: 'Booster — Whisky Cola', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-zombie', nom: 'Booster — Zombie', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-banana', nom: 'Booster — Banana Mama', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'ck-autre', nom: 'Booster (autre cocktail)', prix: 8.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
    { id: 'al-flash', nom: 'Alcool Flash', prix: 15.00, categorie: 'Bières Africaines & Cocktails', eligibleFormule: false },
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
    { id: 'pl-poisson', nom: 'Poisson', prix: 15.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-mouton', nom: 'Mouton', prix: 15.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-aile-simple', nom: 'Aile (simple)', prix: 10.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-aile-plantain', nom: 'Aile avec accompagnement banane plantain', prix: 12.00, categorie: 'Plats & Grillades', eligibleFormule: false },
    { id: 'pl-aile-attieke', nom: 'Aile avec attiéké', prix: 15.00, categorie: 'Plats & Grillades', eligibleFormule: false },
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

  const REGLAGES_INITIAUX = { prixFormuleCents: 1000 };

  /* ------------------------------------------------------------------------
     2. OUTILS : DOM, FORMATS, IDENTIFIANTS
     ------------------------------------------------------------------------ */
  function h(tag, classe, texte) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte !== undefined && texte !== null) e.textContent = texte;
    return e;
  }

  function bouton(libelle, classe, auClic) {
    const b = h('button', classe, libelle);
    b.type = 'button';
    if (auClic) b.addEventListener('click', auClic);
    return b;
  }

  function uid(prefixe) {
    return prefixe + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 46656).toString(36);
  }

  function cloner(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function formaterCents(cents) {
    const c = Math.round(Number(cents) || 0);
    const signe = c < 0 ? '-' : '';
    const abs = Math.abs(c);
    return signe + Math.floor(abs / 100) + ',' + String(abs % 100).padStart(2, '0') + ' €';
  }

  function enCents(euros) {
    return Math.round(Number(euros) * 100);
  }

  function formaterEuros(euros) {
    return formaterCents(enCents(euros));
  }

  function lireMontantSaisi(texte) {
    const v = parseFloat(String(texte || '').trim().replace(',', '.'));
    if (isNaN(v) || v <= 0) return null;
    return Math.round(v * 100);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

  function formaterHeure(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return pad(d.getHours()) + ' h ' + pad(d.getMinutes());
  }

  function formaterDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return JOURS[d.getDay()] + ' ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
  }

  function formaterDateHeure(ts) {
    return ts ? formaterDate(ts) + ' ' + formaterHeure(ts) : '';
  }

  // Heure à afficher : la vraie date si on l'a, sinon le texte repris de l'ancienne version
  function heureDe(ts, texte) {
    return ts ? formaterHeure(ts) : (texte || '');
  }

  /* ------------------------------------------------------------------------
     3. CHARGEMENT SÉCURISÉ ET MIGRATION
     ------------------------------------------------------------------------ */
  const alertesDemarrage = [];

  function lire(cle, valeurParDefaut) {
    let brut = null;
    try {
      brut = localStorage.getItem(cle);
    } catch (e) {
      return cloner(valeurParDefaut);
    }
    if (brut === null || brut === undefined) return cloner(valeurParDefaut);
    try {
      const val = JSON.parse(brut);
      if (Array.isArray(valeurParDefaut) !== Array.isArray(val) || val === null ||
          (typeof valeurParDefaut === 'object') !== (typeof val === 'object')) {
        throw new Error('type inattendu');
      }
      return val;
    } catch (e) {
      // Données illisibles : on les met de côté au lieu de les écraser
      try { localStorage.setItem(cle + '__illisible_' + Date.now(), brut); } catch (e2) { /* rien */ }
      alertesDemarrage.push(cle);
      return cloner(valeurParDefaut);
    }
  }

  function lireTexte(cle) {
    try { return localStorage.getItem(cle); } catch (e) { return null; }
  }

  let catalogue = lire(CLES.CATALOGUE, CATALOGUE_INITIAL);
  let salle = lire(CLES.SALLE, creerSalleInitiale());
  let compteurRef = lire(CLES.COMPTEUR_REF, 101);
  let reglages = Object.assign({}, REGLAGES_INITIAUX, lire(CLES.REGLAGES, REGLAGES_INITIAUX));
  let commandes;
  let tickets;
  let services;
  let payees;

  function nouvelleCommande() {
    return {
      id: null,
      reference: null,
      statut: 'libre', // 'libre' | 'occupee' | 'attente_paiement'
      ouvertLe: null,
      ouvertLeTexte: '',
      statutLe: null,
      statutLeTexte: '',
      modeService: 'Sur place',
      lignes: [],
      paiements: [],
      retraits: [],
      corrections: []
    };
  }

  function migrerDepuisV1() {
    const anciennesCmd = lire(ANCIENNES.COMMANDES, {});
    const histo = lire(ANCIENNES.HISTORIQUE, []);
    const anciennesPayees = lire(ANCIENNES.PAYEES, {});

    const svc = { id: uid('svc'), numero: 1, ouvertLe: histo.length ? null : Date.now(), clotureLe: null };
    services = [svc];
    tickets = [];
    payees = {};
    commandes = {};

    histo.forEach(function (hh) {
      const cents = enCents(hh.montant);
      tickets.push({
        id: hh.id || uid('tk'),
        reference: hh.reference,
        emplacementId: null,
        emplacementNom: hh.emplacementNom,
        modeService: hh.modeService || 'Sur place',
        ouvertLe: null,
        ouvertLeTexte: '',
        termineLe: null,
        heureTexte: hh.heureEncaissement || '',
        statut: 'encaisse',
        legacy: true,
        resume: hh.resume || '',
        lignes: [],
        paiements: [{ id: uid('pay'), ts: null, cents: cents, items: null, serviceId: svc.id }],
        retraits: [],
        corrections: [],
        totalCents: cents,
        serviceId: svc.id
      });
    });

    Object.keys(anciennesCmd).forEach(function (empId) {
      const c = anciennesCmd[empId] || {};
      const lignes = (c.lignes || []).map(function (l) {
        return {
          ligneId: l.ligneId || uid('lig'),
          produitId: l.produitId,
          nom: l.nom,
          prixCents: enCents(l.prixUnitaire),
          quantite: l.quantite,
          detail: l.detail || '',
          ajouteLe: null
        };
      });
      const cmd = nouvelleCommande();
      cmd.lignes = lignes;
      cmd.modeService = c.modeService || 'Sur place';
      cmd.statut = lignes.length ? (c.statut || 'occupee') : 'libre';
      cmd.ouvertLeTexte = c.heureOuverture || '';
      cmd.statutLeTexte = c.heureStatut || '';
      if (lignes.length) {
        cmd.id = uid('tk');
        cmd.reference = c.reference || null;
      }
      commandes[empId] = cmd;
    });

    Object.keys(anciennesPayees).forEach(function (empId) {
      const p = anciennesPayees[empId];
      const t = tickets.find(function (x) { return x.reference === p.reference; });
      if (t) payees[empId] = { ticketId: t.id, ts: null };
    });
  }

  function chargerOuMigrer() {
    if (lireTexte(CLE_VERSION) === '2') {
      commandes = lire(CLES.COMMANDES, {});
      tickets = lire(CLES.TICKETS, []);
      services = lire(CLES.SERVICES, []);
      payees = lire(CLES.PAYEES, {});
    } else {
      migrerDepuisV1();
      sauvegarderTout();
      try { localStorage.setItem(CLE_VERSION, '2'); } catch (e) { /* rien */ }
    }
  }

  let alerteStockage = false;

  function ecrire(cle, valeur) {
    localStorage.setItem(cle, JSON.stringify(valeur));
  }

  function sauvegarderTout() {
    try {
      ecrire(CLES.CATALOGUE, catalogue);
      ecrire(CLES.SALLE, salle);
      ecrire(CLES.COMPTEUR_REF, compteurRef);
      ecrire(CLES.REGLAGES, reglages);
      ecrire(CLES.COMMANDES, commandes);
      ecrire(CLES.TICKETS, tickets);
      ecrire(CLES.SERVICES, services);
      ecrire(CLES.PAYEES, payees);
      alerteStockage = false;
    } catch (e) {
      if (!alerteStockage) {
        alerteStockage = true;
        afficherBandeauAlerte('Sauvegarde locale impossible.', 'Vérifiez l’espace disponible sur la tablette, puis exportez vos données depuis « Gérer la carte et la salle ».');
      }
    }
  }

  chargerOuMigrer();

  let emplacementActifId = salle.length > 0 ? salle[0].id : null;
  let filtreSalleActif = 'tous';
  let categorieCarteActive = 'Toutes les catégories';
  let selectionFormuleEnCours = {};
  let serviceRecapId = null;

  /* ------------------------------------------------------------------------
     4. SERVICES, TICKETS ET CALCULS
     ------------------------------------------------------------------------ */
  function serviceCourant() {
    let s = services.find(function (x) { return !x.clotureLe; });
    if (!s) {
      const numero = services.reduce(function (m, x) { return Math.max(m, x.numero); }, 0) + 1;
      s = { id: uid('svc'), numero: numero, ouvertLe: Date.now(), clotureLe: null };
      services.push(s);
    }
    return s;
  }

  function trouverEmplacement(id) {
    return salle.find(function (e) { return e.id === id; });
  }

  function obtenirCommande(empId) {
    if (!commandes[empId]) commandes[empId] = nouvelleCommande();
    return commandes[empId];
  }

  function genererReference() {
    const ref = 'ESC-' + compteurRef;
    compteurRef += 1;
    return ref;
  }

  function totalLignes(lignes) {
    return (lignes || []).reduce(function (acc, l) { return acc + l.prixCents * l.quantite; }, 0);
  }

  function totalTicket(t) {
    if (t.lignes && t.lignes.length) return totalLignes(t.lignes);
    return t.totalCents || 0;
  }

  function payeCents(t) {
    return (t.paiements || []).reduce(function (acc, p) { return acc + p.cents; }, 0);
  }

  function resteTicket(t) {
    return Math.max(0, totalTicket(t) - payeCents(t));
  }

  function qtePayee(t, ligneId) {
    let n = 0;
    (t.paiements || []).forEach(function (p) {
      (p.items || []).forEach(function (it) {
        if (it.ligneId === ligneId) n += it.qte;
      });
    });
    return n;
  }

  function compterArticles(t) {
    return (t.lignes || []).reduce(function (acc, l) { return acc + l.quantite; }, 0);
  }

  function estActive(cmd) {
    return !!(cmd && cmd.lignes && cmd.lignes.length > 0);
  }

  function resumeLignes(t) {
    if (t.legacy) return t.resume || '';
    if (t.lignes && t.lignes.length) {
      return t.lignes.map(function (l) { return l.quantite + 'x ' + l.nom; }).join(', ');
    }
    if (t.retraits && t.retraits.length) {
      return 'Lignes retirées : ' + t.retraits.map(function (r) { return r.qte + 'x ' + r.nom; }).join(', ');
    }
    return '';
  }

  function ticketDepuisCommande(cmd, empId) {
    const emp = trouverEmplacement(empId);
    return {
      id: cmd.id,
      reference: cmd.reference,
      emplacementId: empId,
      emplacementNom: emp ? emp.nom : empId,
      modeService: cmd.modeService,
      ouvertLe: cmd.ouvertLe,
      ouvertLeTexte: cmd.ouvertLeTexte,
      termineLe: null,
      statut: 'en_cours',
      lignes: cmd.lignes,
      paiements: cmd.paiements,
      retraits: cmd.retraits,
      corrections: cmd.corrections,
      serviceId: null
    };
  }

  function totalService(svcId) {
    let total = 0;
    tickets.forEach(function (t) {
      (t.paiements || []).forEach(function (p) { if (p.serviceId === svcId) total += p.cents; });
    });
    Object.keys(commandes).forEach(function (k) {
      (commandes[k].paiements || []).forEach(function (p) { if (p.serviceId === svcId) total += p.cents; });
    });
    return total;
  }

  // Une entrée par (ticket, service) avec le montant encaissé dans ce service
  function entreesService(svcId) {
    const out = [];
    function cumul(t) {
      let cents = 0; let ts = 0;
      (t.paiements || []).forEach(function (p) {
        if (p.serviceId === svcId) { cents += p.cents; if (p.ts && p.ts > ts) ts = p.ts; }
      });
      return { cents: cents, ts: ts };
    }
    tickets.forEach(function (t) {
      if (t.statut === 'annule') {
        if (t.serviceId === svcId) out.push({ ticket: t, cents: 0, enCours: false, ts: t.termineLe || 0 });
        return;
      }
      const c = cumul(t);
      if (c.cents > 0) out.push({ ticket: t, cents: c.cents, enCours: false, ts: c.ts });
    });
    Object.keys(commandes).forEach(function (empId) {
      const cmd = commandes[empId];
      if (!estActive(cmd) || !cmd.paiements.length) return;
      const c = cumul(cmd);
      if (c.cents > 0) out.push({ ticket: ticketDepuisCommande(cmd, empId), cents: c.cents, enCours: true, ts: c.ts });
    });
    out.sort(function (a, b) { return b.ts - a.ts; });
    return out;
  }

  function statistiquesService(svcId) {
    const termines = tickets.filter(function (t) {
      return t.serviceId === svcId && t.statut === 'encaisse';
    });
    const annules = tickets.filter(function (t) {
      return t.serviceId === svcId && t.statut === 'annule';
    });
    const totalTermines = termines.reduce(function (a, t) { return a + totalTicket(t); }, 0);
    const produits = {};
    termines.forEach(function (t) {
      (t.lignes || []).forEach(function (l) {
        if (!produits[l.nom]) produits[l.nom] = { nom: l.nom, qte: 0, cents: 0 };
        produits[l.nom].qte += l.quantite;
        produits[l.nom].cents += l.prixCents * l.quantite;
      });
    });
    const top = Object.keys(produits).map(function (k) { return produits[k]; })
      .sort(function (a, b) { return b.qte - a.qte || b.cents - a.cents; });
    return {
      total: totalService(svcId),
      nbTickets: termines.length,
      panierMoyen: termines.length ? Math.round(totalTermines / termines.length) : 0,
      nbAnnules: annules.length,
      montantAnnule: annules.reduce(function (a, t) { return a + totalTicket(t); }, 0),
      top: top,
      nbSansDetail: termines.filter(function (t) { return t.legacy; }).length
    };
  }

  /* ------------------------------------------------------------------------
     5. ENCAISSEMENT, ANNULATION, RÉOUVERTURE
     ------------------------------------------------------------------------ */
  function finaliserTicket(empId) {
    const cmd = commandes[empId];
    const emp = trouverEmplacement(empId);
    const t = {
      id: cmd.id,
      reference: cmd.reference,
      emplacementId: empId,
      emplacementNom: emp ? emp.nom : empId,
      modeService: cmd.modeService,
      ouvertLe: cmd.ouvertLe,
      ouvertLeTexte: cmd.ouvertLeTexte,
      termineLe: Date.now(),
      statut: 'encaisse',
      lignes: cmd.lignes,
      paiements: cmd.paiements,
      retraits: cmd.retraits,
      corrections: cmd.corrections,
      totalCents: totalLignes(cmd.lignes),
      serviceId: serviceCourant().id
    };
    tickets.unshift(t);
    commandes[empId] = nouvelleCommande();
    if (t.modeService === 'Sur place') {
      payees[empId] = { ticketId: t.id, ts: t.termineLe };
    } else {
      delete payees[empId];
    }
    return t;
  }

  // Enregistre un paiement ; clôt le ticket si tout est réglé.
  function enregistrerPaiement(empId, cents, items) {
    const cmd = commandes[empId];
    if (!estActive(cmd)) return null;
    const reste = resteTicket(cmd);
    cents = Math.min(cents, reste);
    if (cents <= 0) return null;
    const p = {
      id: uid('pay'),
      ts: Date.now(),
      cents: cents,
      items: items && items.length ? items : null,
      serviceId: serviceCourant().id
    };
    cmd.paiements.push(p);
    let ticketClos = null;
    if (resteTicket(cmd) === 0) ticketClos = finaliserTicket(empId);
    sauvegarderTout();
    return { paiement: p, ticketClos: ticketClos, empId: empId };
  }

  function archiverAnnule(empId, lignesAnnulees) {
    const cmd = commandes[empId];
    const emp = trouverEmplacement(empId);
    const total = lignesAnnulees.length
      ? totalLignes(lignesAnnulees)
      : cmd.retraits.reduce(function (a, r) { return a + r.prixCents * r.qte; }, 0);
    tickets.unshift({
      id: cmd.id || uid('tk'),
      reference: cmd.reference,
      emplacementId: empId,
      emplacementNom: emp ? emp.nom : empId,
      modeService: cmd.modeService,
      ouvertLe: cmd.ouvertLe,
      ouvertLeTexte: cmd.ouvertLeTexte,
      termineLe: Date.now(),
      statut: 'annule',
      lignes: lignesAnnulees,
      paiements: [],
      retraits: cmd.retraits,
      corrections: cmd.corrections,
      totalCents: total,
      serviceId: serviceCourant().id
    });
  }

  function verifierSolde(empId) {
    const cmd = commandes[empId];
    if (estActive(cmd) && cmd.paiements.length && resteTicket(cmd) === 0) {
      finaliserTicket(empId);
    }
  }

  function paiementModifiable(p) {
    if (p.serviceId !== serviceCourant().id) {
      afficherBandeauAlerte(
        'Modification impossible.',
        'Ce paiement appartient à un service déjà clôturé. Il ne peut plus être annulé.'
      );
      return false;
    }
    return true;
  }

  function annulerPaiementActif(empId, payId) {
    const cmd = commandes[empId];
    const idx = cmd.paiements.findIndex(function (p) { return p.id === payId; });
    if (idx === -1) return false;
    const p = cmd.paiements[idx];
    if (!paiementModifiable(p)) return false;
    cmd.paiements.splice(idx, 1);
    cmd.corrections.push({ ts: Date.now(), type: 'paiement_annule', cents: p.cents });
    sauvegarderTout();
    return true;
  }

  // Rouvre un ticket encaissé : annule son dernier paiement et le remet sur la table.
  function rouvrirTicket(ticketId) {
    const idx = tickets.findIndex(function (t) { return t.id === ticketId; });
    if (idx === -1) return false;
    const t = tickets[idx];
    if (t.legacy || t.statut !== 'encaisse') {
      afficherBandeauAlerte('Réouverture impossible.', 'Ce ticket vient de l’ancien journal : son détail n’est pas disponible.');
      return false;
    }
    const emp = trouverEmplacement(t.emplacementId);
    if (!emp) {
      afficherBandeauAlerte('Réouverture impossible.', 'L’emplacement « ' + t.emplacementNom + ' » n’existe plus. Recréez-le puis réessayez.');
      return false;
    }
    if (estActive(commandes[emp.id])) {
      afficherBandeauAlerte(
        'Réouverture impossible.',
        emp.nom + ' a déjà un nouveau ticket en cours. Encaissez-le d’abord.',
        'Ouvrir le ticket de ' + emp.nom,
        function () { emplacementActifId = emp.id; afficherVue('commande'); }
      );
      return false;
    }
    const dernier = t.paiements[t.paiements.length - 1];
    if (!dernier || !paiementModifiable(dernier)) return false;
    t.paiements.pop();
    t.corrections.push({ ts: Date.now(), type: 'paiement_annule', cents: dernier.cents });
    tickets.splice(idx, 1);
    const cmd = nouvelleCommande();
    cmd.id = t.id;
    cmd.reference = t.reference;
    cmd.statut = 'occupee';
    cmd.ouvertLe = t.ouvertLe;
    cmd.ouvertLeTexte = t.ouvertLeTexte || '';
    cmd.statutLe = Date.now();
    cmd.modeService = t.modeService;
    cmd.lignes = t.lignes;
    cmd.paiements = t.paiements;
    cmd.retraits = t.retraits;
    cmd.corrections = t.corrections;
    commandes[emp.id] = cmd;
    delete payees[emp.id];
    sauvegarderTout();
    return true;
  }

  /* ------------------------------------------------------------------------
     6. NAVIGATION
     ------------------------------------------------------------------------ */
  const vueSalle = document.getElementById('vue-salle');
  const vueCommande = document.getElementById('vue-commande');
  const vueRecap = document.getElementById('vue-recap');
  const vueAdmin = document.getElementById('vue-admin');
  const navBtnSalle = document.getElementById('nav-btn-salle');
  const navBtnCommande = document.getElementById('nav-btn-commande');
  const navBtnRecap = document.getElementById('nav-btn-recap');
  const navBtnAdmin = document.getElementById('nav-btn-admin');

  function afficherVue(nomVue) {
    cacherBandeauAlerte();
    vueSalle.hidden = (nomVue !== 'salle');
    vueCommande.hidden = (nomVue !== 'commande');
    vueRecap.hidden = (nomVue !== 'recap');
    vueAdmin.hidden = (nomVue !== 'admin');
    navBtnSalle.classList.toggle('est-actif', nomVue === 'salle');
    navBtnCommande.classList.toggle('est-actif', nomVue === 'commande');
    navBtnRecap.classList.toggle('est-actif', nomVue === 'recap');
    navBtnAdmin.classList.toggle('est-actif', nomVue === 'admin');

    if (nomVue === 'salle') {
      rendreVueSalle();
    } else if (nomVue === 'commande') {
      if (!emplacementActifId && salle.length > 0) emplacementActifId = salle[0].id;
      rendreVueCommande();
    } else if (nomVue === 'recap') {
      rendreVueRecap();
    } else if (nomVue === 'admin') {
      rendreVueAdmin();
    }
  }

  navBtnSalle.addEventListener('click', function () { afficherVue('salle'); });
  navBtnCommande.addEventListener('click', function () { afficherVue('commande'); });
  navBtnRecap.addEventListener('click', function () { afficherVue('recap'); });
  navBtnAdmin.addEventListener('click', function () { afficherVue('admin'); });
  document.getElementById('btn-retour-salle').addEventListener('click', function () { afficherVue('salle'); });
  document.getElementById('btn-admin-retour-salle').addEventListener('click', function () { afficherVue('salle'); });
  document.getElementById('btn-recap-retour-salle').addEventListener('click', function () { afficherVue('salle'); });

  /* ------------------------------------------------------------------------
     7. ALERTES, MESSAGES, CONFIRMATION
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
    if (bandeauGlobal.scrollIntoView) bandeauGlobal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function cacherBandeauAlerte() {
    bandeauGlobal.hidden = true;
  }

  document.getElementById('bandeau-fermer').addEventListener('click', cacherBandeauAlerte);

  function afficherMessageTemporaire(texte, ton, callbackAnnuler) {
    const zone = document.getElementById('zone-messages');
    while (zone.children.length >= 3) zone.removeChild(zone.firstChild);

    const msg = h('div', 'message-temporaire message-temporaire--' + (ton || 'info'));
    msg.appendChild(h('span', null, texte));

    const actionsDiv = h('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '8px';

    if (typeof callbackAnnuler === 'function') {
      actionsDiv.appendChild(bouton('Annuler', 'btn-message-action', function () {
        callbackAnnuler();
        if (msg.parentNode) msg.parentNode.removeChild(msg);
      }));
    }
    actionsDiv.appendChild(bouton('Fermer', 'btn-message-action', function () {
      if (msg.parentNode) msg.parentNode.removeChild(msg);
    }));
    msg.appendChild(actionsDiv);
    zone.appendChild(msg);

    if (ton !== 'erreur') {
      setTimeout(function () {
        if (msg.parentNode) msg.parentNode.removeChild(msg);
      }, typeof callbackAnnuler === 'function' ? 9000 : 5000);
    }
  }

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
    btnConfirmationGarder.focus();
    btnConfirmationGarder.onclick = function () { modaleConfirmation.hidden = true; };
    btnConfirmationDetruire.onclick = function () {
      modaleConfirmation.hidden = true;
      if (typeof options.actionConfirmee === 'function') options.actionConfirmee();
    };
  }

  /* ------------------------------------------------------------------------
     8. VUE 1 : ÉTAT DE LA SALLE
     ------------------------------------------------------------------------ */
  function obtenirStatutLisible(cmd, empId) {
    const paiement = empId ? payees[empId] : null;
    if (!estActive(cmd)) {
      if (paiement) {
        const t = tickets.find(function (x) { return x.id === paiement.ticketId; });
        return {
          mot: 'Payée',
          classeTon: 'statut-mot--succes',
          repereTemps: t ? 'à ' + heureDe(t.termineLe, t.heureTexte) + ' (' + formaterCents(totalTicket(t)) + ')' : ''
        };
      }
      return { mot: 'Libre', classeTon: 'statut-mot--neutre', repereTemps: 'Aucun ticket ouvert' };
    }
    const depuis = heureDe(cmd.ouvertLe, cmd.ouvertLeTexte);
    if (cmd.paiements.length) {
      return {
        mot: 'Partiellement payée',
        classeTon: 'statut-mot--attente',
        repereTemps: 'reste ' + formaterCents(resteTicket(cmd)) + ' (' + cmd.modeService + ')'
      };
    }
    if (cmd.statut === 'attente_paiement') {
      return {
        mot: 'En attente d’encaissement',
        classeTon: 'statut-mot--alerte',
        repereTemps: 'depuis ' + (heureDe(cmd.statutLe, cmd.statutLeTexte) || depuis) + ' (' + cmd.modeService + ')'
      };
    }
    return {
      mot: 'Occupée',
      classeTon: 'statut-mot--attente',
      repereTemps: 'depuis ' + depuis + ' (' + cmd.modeService + ')'
    };
  }

  function libelleService(svc) {
    if (!svc.ouvertLe) return 'Service n°' + svc.numero + ' (repris de l’ancien journal)';
    return 'Service n°' + svc.numero + ' du ' + formaterDateHeure(svc.ouvertLe);
  }

  function rendreVueSalle() {
    const svc = serviceCourant();
    const listeEl = document.getElementById('liste-emplacements-salle');
    listeEl.innerHTML = '';

    let nbOccupes = 0;
    let totalEnCours = 0;
    salle.forEach(function (emp) {
      const cmd = obtenirCommande(emp.id);
      if (estActive(cmd)) {
        nbOccupes += 1;
        totalEnCours += resteTicket(cmd);
      }
    });

    document.getElementById('stat-occupes').textContent = nbOccupes + ' sur ' + salle.length;
    document.getElementById('stat-en-cours').textContent = formaterCents(totalEnCours);
    document.getElementById('stat-encaisse').textContent = formaterCents(totalService(svc.id));
    document.getElementById('service-info').textContent = libelleService(svc);
    rendreDerniersEncaissements();

    const filtres = salle.filter(function (emp) {
      const cmd = obtenirCommande(emp.id);
      const occupe = estActive(cmd);
      if (filtreSalleActif === 'occupees') return occupe;
      if (filtreSalleActif === 'payees') return !occupe && !!payees[emp.id];
      if (filtreSalleActif === 'tables') return emp.type === 'table';
      if (filtreSalleActif === 'comptoir') return emp.type === 'comptoir';
      return true;
    });

    if (filtres.length === 0) {
      const liVide = h('li');
      liVide.style.padding = '24px';
      liVide.appendChild(h('p', 'titre-bloc', 'Aucun emplacement dans cette vue'));
      const p = h('p', 'texte-secondaire', 'Affichez tous les emplacements pour ouvrir une nouvelle table.');
      p.style.marginTop = '4px';
      liVide.appendChild(p);
      listeEl.appendChild(liVide);
      return;
    }

    filtres.forEach(function (emp) {
      const cmd = obtenirCommande(emp.id);
      const occupe = estActive(cmd);
      let tk = null;
      if (!occupe && payees[emp.id]) {
        tk = tickets.find(function (x) { return x.id === payees[emp.id].ticketId; }) || null;
        if (!tk) delete payees[emp.id];
      }
      const statutInfo = obtenirStatutLisible(cmd, emp.id);

      const li = h('li', 'ligne-registre' + (occupe ? ' ligne-registre--active' : '') + (tk ? ' ligne-registre--payee' : ''));

      li.appendChild(h('div', 'cellule-nom', emp.nom));

      const divStatut = h('div', 'statut-ligne');
      divStatut.appendChild(h('span', 'statut-mot ' + statutInfo.classeTon, statutInfo.mot));
      divStatut.appendChild(h('span', 'statut-temps', statutInfo.repereTemps));
      li.appendChild(divStatut);

      const divApercu = h('div', 'cellule-apercu');
      if (occupe) {
        divApercu.textContent = cmd.reference + ' — ' + resumeLignes(cmd);
      } else if (tk) {
        divApercu.textContent = tk.reference + ' — ' + resumeLignes(tk);
      } else {
        divApercu.textContent = 'Prête à accueillir des clients';
      }
      li.appendChild(divApercu);

      li.appendChild(h('div', 'cellule-montant',
        formaterCents(occupe ? resteTicket(cmd) : (tk ? totalTicket(tk) : 0))));

      const divAction = h('div', 'cellule-action');
      if (tk) {
        divAction.style.display = 'flex';
        divAction.style.gap = '8px';
        divAction.style.flexWrap = 'wrap';
        divAction.appendChild(bouton('Revoir le ticket', 'btn btn--secondaire', function () {
          ouvrirDetailTicket(tk);
        }));
        divAction.appendChild(bouton('Libérer la table', 'btn btn--principal', function () {
          delete payees[emp.id];
          sauvegarderTout();
          rendreVueSalle();
          afficherMessageTemporaire(emp.nom + ' libérée.', 'info');
        }));
      }
      divAction.appendChild(bouton(occupe ? 'Reprendre le ticket' : 'Ouvrir la table',
        occupe ? 'btn btn--principal' : 'btn btn--secondaire',
        function () { emplacementActifId = emp.id; afficherVue('commande'); }));
      li.appendChild(divAction);

      listeEl.appendChild(li);
    });
  }

  function rendreDerniersEncaissements() {
    const listeEl = document.getElementById('liste-derniers-encaissements');
    listeEl.innerHTML = '';
    const entrees = entreesService(serviceCourant().id).filter(function (e) { return e.cents > 0; });

    if (entrees.length === 0) {
      const liVide = h('li');
      liVide.style.padding = '24px';
      liVide.appendChild(h('p', 'titre-bloc', 'Aucun encaissement pour le moment'));
      const p = h('p', 'texte-secondaire', 'Les tickets encaissés pendant ce service apparaîtront ici.');
      p.style.marginTop = '4px';
      liVide.appendChild(p);
      listeEl.appendChild(liVide);
      return;
    }

    entrees.slice(0, 10).forEach(function (e) {
      const t = e.ticket;
      const li = h('li', 'ligne-registre');
      li.style.gridTemplateColumns = '1fr 1.8fr auto auto';

      const divNom = h('div');
      divNom.appendChild(h('span', 'cellule-nom', t.emplacementNom));
      divNom.appendChild(h('span', 'statut-temps',
        ' payé à ' + (e.ts ? formaterHeure(e.ts) : heureDe(null, t.heureTexte)) + (e.enCours ? ' (partiel)' : '')));
      li.appendChild(divNom);

      li.appendChild(h('div', 'cellule-apercu', (t.reference || '') + ' — ' + resumeLignes(t)));
      li.appendChild(h('div', 'cellule-montant', formaterCents(e.cents)));
      li.appendChild(bouton('Voir', 'btn btn--discret', function () { ouvrirDetailTicket(t); }));
      listeEl.appendChild(li);
    });
  }

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
     9. VUE 2 : PRISE DE COMMANDE ET TICKET
     ------------------------------------------------------------------------ */
  function rendreVueCommande() {
    const selecteur = document.getElementById('selecteur-table-rapide');
    selecteur.innerHTML = '';
    salle.forEach(function (emp) {
      const cmd = obtenirCommande(emp.id);
      const opt = h('option');
      opt.value = emp.id;
      const reste = estActive(cmd) ? resteTicket(cmd) : 0;
      opt.textContent = emp.nom + (estActive(cmd) ? ' (' + formaterCents(reste) + ')' : ' (Libre)');
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
      if (cats.indexOf(item.categorie) === -1) cats.push(item.categorie);
    });
    return cats;
  }

  function rendreOngletsCategories() {
    const barre = document.getElementById('barre-categories-carte');
    barre.innerHTML = '';
    obtenirCategoriesUniques().forEach(function (cat) {
      const b = bouton(cat, 'btn btn--secondaire' + (cat === categorieCarteActive ? ' est-actif' : ''), function () {
        categorieCarteActive = cat;
        document.getElementById('titre-categorie-active').textContent = cat;
        rendreOngletsCategories();
        rendreListeProduitsCarte();
      });
      barre.appendChild(b);
    });
  }

  function rendreListeProduitsCarte() {
    const conteneur = document.getElementById('liste-produits-carte');
    conteneur.innerHTML = '';

    const produits = catalogue.filter(function (p) {
      return categorieCarteActive === 'Toutes les catégories' || p.categorie === categorieCarteActive;
    });

    if (produits.length === 0) {
      const div = h('div');
      div.style.padding = '24px';
      div.appendChild(h('p', 'titre-bloc', 'Aucun produit dans cette catégorie'));
      div.appendChild(h('p', 'texte-secondaire', 'Ajoutez vos nouveaux produits depuis l’écran Gérer la carte et la salle.'));
      conteneur.appendChild(div);
      return;
    }

    produits.forEach(function (produit) {
      const btnLigne = h('button', 'ligne-produit-carte');
      btnLigne.type = 'button';

      const divInfos = h('div', 'produit-infos');
      divInfos.appendChild(h('span', 'produit-nom', produit.nom));
      divInfos.appendChild(h('span', 'produit-precision',
        produit.categorie + (produit.eligibleFormule ? ' — Éligible Formule 4 boissons à ' + formaterCents(reglages.prixFormuleCents) : '')));

      const divDroite = h('div', 'produit-droite');
      divDroite.appendChild(h('span', 'produit-prix', formaterEuros(produit.prix)));
      divDroite.appendChild(h('span', 'produit-action-mot', 'Ajouter au ticket'));

      btnLigne.appendChild(divInfos);
      btnLigne.appendChild(divDroite);
      btnLigne.addEventListener('click', function () { ajouterProduitAuTicket(produit); });
      conteneur.appendChild(btnLigne);
    });
  }

  function ajouterProduitAuTicket(produit, detailPersonnalise) {
    if (!emplacementActifId) return;
    const cmd = obtenirCommande(emplacementActifId);
    const maintenant = Date.now();
    const prixCents = produit.prixCents != null ? produit.prixCents : enCents(produit.prix);

    // De nouveaux clients commandent : la table n'est plus signalée comme payée
    delete payees[emplacementActifId];

    if (!estActive(cmd)) {
      if (!cmd.id) cmd.id = uid('tk');
      if (!cmd.reference) cmd.reference = genererReference();
      cmd.ouvertLe = maintenant;
      cmd.ouvertLeTexte = '';
      cmd.retraits = [];
      cmd.corrections = [];
      cmd.paiements = [];
    }
    cmd.statut = 'occupee';
    cmd.statutLe = maintenant;

    if (!detailPersonnalise) {
      const existante = cmd.lignes.find(function (l) {
        return l.produitId === produit.id && !l.detail && l.prixCents === prixCents;
      });
      if (existante) {
        existante.quantite += 1;
        sauvegarderTout();
        rendreVueCommande();
        return;
      }
    }

    cmd.lignes.push({
      ligneId: uid('lig'),
      produitId: produit.id,
      nom: produit.nom,
      prixCents: prixCents,
      quantite: 1,
      detail: detailPersonnalise || '',
      ajouteLe: maintenant
    });
    sauvegarderTout();
    rendreVueCommande();
  }

  function modifierQuantiteLigne(ligneId, delta) {
    const empId = emplacementActifId;
    const cmd = obtenirCommande(empId);
    const idx = cmd.lignes.findIndex(function (l) { return l.ligneId === ligneId; });
    if (idx === -1) return;
    const l = cmd.lignes[idx];

    const dejaPayees = qtePayee(cmd, ligneId);
    let nq = l.quantite + delta;
    if (nq < dejaPayees) nq = dejaPayees;
    const retire = l.quantite - nq;
    if (nq === l.quantite) return;

    if (nq <= 0 && cmd.paiements.length > 0 && cmd.lignes.length === 1) {
      afficherBandeauAlerte('Retrait impossible.', 'Des paiements ont déjà été encaissés sur ce ticket. Annulez-les avant de retirer la dernière ligne.');
      return;
    }

    // Trace des retraits faits après coup (une erreur de saisie rattrapée tout de suite n'est pas notée)
    if (retire > 0 && (!l.ajouteLe || Date.now() - l.ajouteLe > 120000)) {
      cmd.retraits.push({ ts: Date.now(), nom: l.nom, qte: retire, prixCents: l.prixCents });
    }

    l.quantite = nq;
    if (nq <= 0) cmd.lignes.splice(idx, 1);

    if (cmd.lignes.length === 0) {
      if (cmd.retraits.length) archiverAnnule(empId, []);
      const ref = cmd.reference;
      commandes[empId] = nouvelleCommande();
      commandes[empId].reference = ref; // numéro conservé pour le prochain ticket de cet emplacement
    } else {
      verifierSolde(empId);
    }
    sauvegarderTout();
    rendreVueCommande();
  }

  function rendreTicketActif() {
    const emp = trouverEmplacement(emplacementActifId);
    if (!emp) return;

    const cmd = obtenirCommande(emp.id);
    const statutInfo = obtenirStatutLisible(cmd, emp.id);
    const actif = estActive(cmd);

    document.getElementById('ticket-reference').textContent = cmd.reference || 'Nouveau ticket';
    document.getElementById('ticket-nom-emplacement').textContent = emp.nom;
    document.getElementById('ticket-statut-texte').textContent = statutInfo.mot;
    document.getElementById('ticket-statut-heure').textContent = actif || payees[emp.id] ? statutInfo.repereTemps : 'Aucune commande ouverte';

    document.getElementById('btn-mode-sur-place').setAttribute('aria-pressed', cmd.modeService === 'Sur place' ? 'true' : 'false');
    document.getElementById('btn-mode-emporter').setAttribute('aria-pressed', cmd.modeService === 'À emporter' ? 'true' : 'false');

    const listeLignesEl = document.getElementById('ticket-liste-lignes');
    listeLignesEl.innerHTML = '';

    if (!actif) {
      const li = h('li', 'etat-vide-ticket');
      li.appendChild(h('p', 'etat-vide-titre', 'Aucune consommation enregistrée'));
      li.appendChild(h('p', 'etat-vide-texte', 'Touchez un plat ou une boisson dans la liste de gauche pour ouvrir le ticket de ' + emp.nom + '.'));
      listeLignesEl.appendChild(li);
    } else {
      cmd.lignes.forEach(function (ligne) {
        const payees_ = qtePayee(cmd, ligne.ligneId);
        const aPayer = ligne.quantite - payees_;
        const li = h('li', 'ticket-ligne');

        const divP = h('div', 'ticket-ligne-principale');
        divP.appendChild(h('span', 'ticket-qte', ligne.quantite + 'x'));
        divP.appendChild(h('span', 'ticket-designation', ligne.nom));
        divP.appendChild(h('span', 'ticket-montant', formaterCents(ligne.prixCents * ligne.quantite)));
        li.appendChild(divP);

        if (ligne.detail) li.appendChild(h('p', 'ticket-detail-formule', ligne.detail));
        if (payees_ > 0) {
          li.appendChild(h('p', 'ticket-detail-formule',
            payees_ === ligne.quantite ? 'Entièrement payé' : payees_ + ' déjà payé' + (payees_ > 1 ? 's' : '') + ', ' + aPayer + ' à payer'));
        }

        const divC = h('div', 'ticket-controles-ligne');
        const btnMoins = bouton('- 1', 'btn-qte-ticket', function () { modifierQuantiteLigne(ligne.ligneId, -1); });
        btnMoins.setAttribute('aria-label', 'Retirer une unité de ' + ligne.nom);
        btnMoins.disabled = aPayer <= 0;
        const btnPlus = bouton('+ 1', 'btn-qte-ticket', function () { modifierQuantiteLigne(ligne.ligneId, 1); });
        btnPlus.setAttribute('aria-label', 'Ajouter une unité de ' + ligne.nom);
        const btnSuppr = bouton('Retirer la ligne', 'btn-retirer-ligne', function () {
          modifierQuantiteLigne(ligne.ligneId, -aPayer);
        });
        btnSuppr.disabled = aPayer <= 0;
        divC.appendChild(btnMoins);
        divC.appendChild(btnPlus);
        divC.appendChild(btnSuppr);
        li.appendChild(divC);
        listeLignesEl.appendChild(li);
      });
    }

    const nb = compterArticles(cmd);
    const total = totalLignes(cmd.lignes);
    const paye = payeCents(cmd);
    const reste = Math.max(0, total - paye);

    document.getElementById('ticket-nb-articles').textContent = nb + (nb > 1 ? ' articles' : ' article');
    document.getElementById('ticket-montant-total').textContent = formaterCents(reste);
    document.getElementById('ticket-total-libelle').textContent = paye > 0 ? 'Reste à régler' : 'Total à régler';

    document.getElementById('ticket-ligne-brut').hidden = paye === 0;
    document.getElementById('ticket-montant-brut').textContent = formaterCents(total);
    document.getElementById('ticket-ligne-deja-paye').hidden = paye === 0;
    document.getElementById('ticket-montant-deja-paye').textContent = formaterCents(paye);

    const listePaiements = document.getElementById('ticket-paiements');
    listePaiements.innerHTML = '';
    listePaiements.hidden = cmd.paiements.length === 0;
    cmd.paiements.forEach(function (p) {
      const li = h('li', 'ticket-paiement-ligne');
      li.appendChild(h('span', null, 'Payé à ' + formaterHeure(p.ts) + ' : ' + formaterCents(p.cents)));
      li.appendChild(bouton('Annuler ce paiement', 'btn-ticket-secondaire', function () {
        demanderConfirmation({
          titre: 'Annuler ce paiement ?',
          consequences: 'Le paiement de ' + formaterCents(p.cents) + ' sera retiré du total encaissé. Le ticket de ' + emp.nom + ' reste ouvert.',
          verbeGarder: 'Garder le paiement',
          verbeDetruire: 'Annuler le paiement',
          actionConfirmee: function () {
            if (annulerPaiementActif(emp.id, p.id)) {
              rendreVueCommande();
              afficherMessageTemporaire('Paiement annulé.', 'info');
            }
          }
        });
      }));
      listePaiements.appendChild(li);
    });

    const btnEnc = document.getElementById('btn-encaisser-ticket');
    btnEnc.textContent = paye > 0 ? 'Encaisser le reste (' + formaterCents(reste) + ')' : 'Encaisser le ticket';
    btnEnc.disabled = !actif || reste <= 0;
    document.getElementById('btn-partager-addition').disabled = !actif || reste <= 0;
    document.getElementById('btn-marquer-attente').disabled = !actif;
    document.getElementById('btn-vider-ticket').disabled = !actif;
  }

  document.getElementById('btn-mode-sur-place').addEventListener('click', function () {
    obtenirCommande(emplacementActifId).modeService = 'Sur place';
    sauvegarderTout();
    rendreTicketActif();
  });

  document.getElementById('btn-mode-emporter').addEventListener('click', function () {
    obtenirCommande(emplacementActifId).modeService = 'À emporter';
    sauvegarderTout();
    rendreTicketActif();
  });

  document.getElementById('btn-marquer-attente').addEventListener('click', function () {
    const cmd = obtenirCommande(emplacementActifId);
    if (!estActive(cmd)) return;
    cmd.statut = 'attente_paiement';
    cmd.statutLe = Date.now();
    sauvegarderTout();
    rendreTicketActif();
    afficherMessageTemporaire('Ticket marqué en attente de paiement.', 'info');
  });

  document.getElementById('btn-vider-ticket').addEventListener('click', function () {
    const emp = trouverEmplacement(emplacementActifId);
    const empId = emplacementActifId;
    const cmd = obtenirCommande(empId);
    if (!estActive(cmd)) return;
    if (cmd.paiements.length) {
      afficherBandeauAlerte('Ticket impossible à vider.', 'Des paiements ont déjà été encaissés sur ce ticket. Annulez-les d’abord (bouton « Annuler ce paiement »).');
      return;
    }
    demanderConfirmation({
      titre: 'Vider le ticket de ' + (emp ? emp.nom : 'cet emplacement') + ' ?',
      consequences: 'Les lignes de ce ticket (' + formaterCents(totalLignes(cmd.lignes)) + ') seront annulées. Elles ne comptent pas dans la recette, mais restent notées dans le recap comme ticket annulé.',
      verbeGarder: 'Garder le ticket',
      verbeDetruire: 'Vider le ticket',
      actionConfirmee: function () {
        archiverAnnule(empId, cmd.lignes);
        const ref = cmd.reference;
        commandes[empId] = nouvelleCommande();
        commandes[empId].reference = ref;
        sauvegarderTout();
        rendreVueCommande();
        afficherMessageTemporaire('Ticket vidé (noté dans le recap comme annulé).', 'info');
      }
    });
  });

  // Encaisser tout le reste du ticket
  document.getElementById('btn-encaisser-ticket').addEventListener('click', function () {
    const empId = emplacementActifId;
    const cmd = obtenirCommande(empId);
    if (!estActive(cmd)) return;
    const reste = resteTicket(cmd);
    if (reste <= 0) return;
    const items = [];
    cmd.lignes.forEach(function (l) {
      const q = l.quantite - qtePayee(cmd, l.ligneId);
      if (q > 0) items.push({ ligneId: l.ligneId, qte: q });
    });
    const nomEmp = (trouverEmplacement(empId) || {}).nom || empId;
    const res = enregistrerPaiement(empId, reste, items);
    if (!res) return;
    rendreVueCommande();
    annoncerPaiement(res, nomEmp);
  });

  function annoncerPaiement(res, nomEmp) {
    const clos = res.ticketClos;
    afficherMessageTemporaire(
      (clos ? 'Ticket encaissé' : 'Paiement enregistré') + ' (' + formaterCents(res.paiement.cents) + ' — ' + nomEmp + ').' +
      (clos && clos.modeService === 'Sur place' ? ' La table reste marquée payée dans la salle.' : ''),
      'succes',
      function () {
        if (clos) {
          if (rouvrirTicket(clos.id)) {
            emplacementActifId = clos.emplacementId;
            afficherVue('commande');
          }
        } else if (annulerPaiementActif(res.empId || emplacementActifId, res.paiement.id)) {
          rendreVueCommande();
        }
      }
    );
  }

  /* ------------------------------------------------------------------------
     10. ADDITION PARTAGÉE
     ------------------------------------------------------------------------ */
  const modalePartage = document.getElementById('modale-partage');
  const partageCorps = document.getElementById('partage-corps');
  const btnValiderPartage = document.getElementById('btn-valider-partage');
  let partage = null;

  function ouvrirPartage() {
    const cmd = obtenirCommande(emplacementActifId);
    if (!estActive(cmd) || resteTicket(cmd) <= 0) return;
    partage = { empId: emplacementActifId, mode: 'articles', sel: {}, parts: 2, libre: '' };
    rendrePartage();
    modalePartage.hidden = false;
  }

  function fermerPartage() {
    modalePartage.hidden = true;
    partage = null;
  }

  function totalSelectionPartage(cmd) {
    return cmd.lignes.reduce(function (acc, l) {
      return acc + (partage.sel[l.ligneId] || 0) * l.prixCents;
    }, 0);
  }

  function apresPaiementPartage(res, nomEmp) {
    res.empId = partage ? partage.empId : emplacementActifId;
    rendreVueCommande();
    annoncerPaiement(res, nomEmp);
    if (res.ticketClos) {
      fermerPartage();
    } else if (partage) {
      partage.sel = {};
      partage.libre = '';
      rendrePartage();
    }
  }

  function rendrePartage() {
    const emp = trouverEmplacement(partage.empId);
    const cmd = obtenirCommande(partage.empId);
    const reste = resteTicket(cmd);
    document.getElementById('partage-sous-titre').textContent =
      (emp ? emp.nom : '') + ' — reste à régler : ' + formaterCents(reste) + ' sur ' + formaterCents(totalLignes(cmd.lignes));

    document.getElementById('partage-onglet-articles').classList.toggle('est-actif', partage.mode === 'articles');
    document.getElementById('partage-onglet-montant').classList.toggle('est-actif', partage.mode === 'montant');
    partageCorps.innerHTML = '';

    if (partage.mode === 'articles') {
      partageCorps.appendChild(h('p', 'texte-secondaire',
        'Choisissez ce que cette personne règle, puis encaissez. Les autres articles restent sur le ticket.'));

      cmd.lignes.forEach(function (l) {
        const restant = l.quantite - qtePayee(cmd, l.ligneId);
        if (restant <= 0) return;
        const sel = partage.sel[l.ligneId] || 0;

        const div = h('div', 'ligne-choix-boisson');
        const texte = h('div');
        texte.appendChild(h('span', 'produit-nom', l.nom));
        texte.appendChild(h('span', 'texte-secondaire', ' (' + formaterCents(l.prixCents) + ' — ' + restant + ' à payer)'));
        if (l.detail) texte.appendChild(h('div', 'texte-secondaire', l.detail));
        div.appendChild(texte);

        const ctrl = h('div', 'controles-choix-boisson');
        const moins = bouton('- 1', 'btn btn--secondaire', function () {
          partage.sel[l.ligneId] = Math.max(0, (partage.sel[l.ligneId] || 0) - 1);
          rendrePartage();
        });
        moins.disabled = sel <= 0;
        const nombre = h('span', 'reference', String(sel));
        nombre.style.minWidth = '28px';
        nombre.style.textAlign = 'center';
        const plus = bouton('+ 1', 'btn btn--secondaire', function () {
          partage.sel[l.ligneId] = Math.min(restant, (partage.sel[l.ligneId] || 0) + 1);
          rendrePartage();
        });
        plus.disabled = sel >= restant;
        ctrl.appendChild(moins);
        ctrl.appendChild(nombre);
        ctrl.appendChild(plus);
        div.appendChild(ctrl);
        partageCorps.appendChild(div);
      });

      const barre = h('div');
      barre.style.marginTop = '16px';
      barre.appendChild(bouton('Tout sélectionner', 'btn btn--discret', function () {
        cmd.lignes.forEach(function (l) {
          const r = l.quantite - qtePayee(cmd, l.ligneId);
          if (r > 0) partage.sel[l.ligneId] = r;
        });
        rendrePartage();
      }));
      barre.appendChild(bouton('Tout effacer', 'btn btn--discret', function () {
        partage.sel = {};
        rendrePartage();
      }));
      partageCorps.appendChild(barre);

      const sommeSel = Math.min(totalSelectionPartage(cmd), reste);
      btnValiderPartage.hidden = false;
      btnValiderPartage.disabled = sommeSel <= 0;
      btnValiderPartage.textContent = sommeSel > 0 ? 'Encaisser ' + formaterCents(sommeSel) : 'Choisissez des articles';
    } else {
      btnValiderPartage.hidden = true;

      const blocParts = h('div', 'formulaire-bloc');
      blocParts.appendChild(h('h3', 'titre-bloc', 'Parts égales'));
      blocParts.appendChild(h('p', 'texte-secondaire',
        'Le reste est divisé entre les personnes qui n’ont pas encore payé. La dernière paie exactement ce qui reste.'));

      const ligneNb = h('div', 'ligne-choix-boisson');
      ligneNb.appendChild(h('span', 'champ-libelle', 'Personnes qui paient encore :'));
      const ctrl = h('div', 'controles-choix-boisson');
      const moins = bouton('- 1', 'btn btn--secondaire', function () {
        partage.parts = Math.max(1, partage.parts - 1);
        rendrePartage();
      });
      moins.disabled = partage.parts <= 1;
      const nombre = h('span', 'reference', String(partage.parts));
      nombre.style.minWidth = '28px';
      nombre.style.textAlign = 'center';
      const plus = bouton('+ 1', 'btn btn--secondaire', function () {
        partage.parts = Math.min(30, partage.parts + 1);
        rendrePartage();
      });
      ctrl.appendChild(moins);
      ctrl.appendChild(nombre);
      ctrl.appendChild(plus);
      ligneNb.appendChild(ctrl);
      blocParts.appendChild(ligneNb);

      const part = partage.parts <= 1 ? reste : Math.round(reste / partage.parts);
      const btnPart = bouton('Encaisser une part (' + formaterCents(part) + ')', 'btn btn--principal', function () {
        const empId = partage.empId;
        const nomEmp = (trouverEmplacement(empId) || {}).nom || empId;
        const res = enregistrerPaiement(empId, part, null);
        if (!res) return;
        partage.parts = Math.max(1, partage.parts - 1);
        apresPaiementPartage(res, nomEmp);
      });
      btnPart.style.marginTop = '12px';
      blocParts.appendChild(btnPart);
      partageCorps.appendChild(blocParts);

      const blocLibre = h('div', 'formulaire-bloc');
      blocLibre.style.marginTop = '16px';
      blocLibre.appendChild(h('h3', 'titre-bloc', 'Montant libre'));
      const champ = h('input', 'champ-saisie chasse-fixe');
      champ.type = 'text';
      champ.inputMode = 'decimal';
      champ.value = partage.libre;
      champ.setAttribute('aria-label', 'Montant en euros');
      champ.placeholder = 'Ex. : 12,50';
      champ.addEventListener('input', function () { partage.libre = champ.value; });
      const erreur = h('span', 'champ-erreur-texte');
      erreur.hidden = true;
      const btnLibre = bouton('Encaisser ce montant', 'btn btn--secondaire', function () {
        const cents = lireMontantSaisi(champ.value);
        if (cents === null) {
          erreur.textContent = 'Saisissez un montant supérieur à 0 (exemple : 12,50).';
          erreur.hidden = false;
          champ.classList.add('en-erreur');
          return;
        }
        if (cents > reste) {
          erreur.textContent = 'Ce montant dépasse le reste à régler (' + formaterCents(reste) + ').';
          erreur.hidden = false;
          champ.classList.add('en-erreur');
          return;
        }
        const empId = partage.empId;
        const nomEmp = (trouverEmplacement(empId) || {}).nom || empId;
        const res = enregistrerPaiement(empId, cents, null);
        if (!res) return;
        apresPaiementPartage(res, nomEmp);
      });
      btnLibre.style.marginTop = '12px';
      blocLibre.appendChild(champ);
      blocLibre.appendChild(erreur);
      blocLibre.appendChild(btnLibre);
      partageCorps.appendChild(blocLibre);
    }
  }

  document.getElementById('btn-partager-addition').addEventListener('click', ouvrirPartage);
  document.getElementById('btn-fermer-partage').addEventListener('click', fermerPartage);
  document.getElementById('partage-onglet-articles').addEventListener('click', function () {
    if (partage) { partage.mode = 'articles'; rendrePartage(); }
  });
  document.getElementById('partage-onglet-montant').addEventListener('click', function () {
    if (partage) { partage.mode = 'montant'; rendrePartage(); }
  });

  btnValiderPartage.addEventListener('click', function () {
    if (!partage || partage.mode !== 'articles') return;
    const empId = partage.empId;
    const cmd = obtenirCommande(empId);
    const items = [];
    cmd.lignes.forEach(function (l) {
      const q = partage.sel[l.ligneId] || 0;
      if (q > 0) items.push({ ligneId: l.ligneId, qte: q });
    });
    const cents = Math.min(totalSelectionPartage(cmd), resteTicket(cmd));
    if (cents <= 0) return;
    const nomEmp = (trouverEmplacement(empId) || {}).nom || empId;
    const res = enregistrerPaiement(empId, cents, items);
    if (!res) return;
    apresPaiementPartage(res, nomEmp);
  });

  /* ------------------------------------------------------------------------
     11. FORMULE 4 BOISSONS
     ------------------------------------------------------------------------ */
  const modaleFormule = document.getElementById('modale-formule');
  const listeEligiblesEl = document.getElementById('liste-boissons-eligibles-formule');
  const compteurFormuleEl = document.getElementById('compteur-boissons-formule');
  const btnValiderFormule = document.getElementById('btn-valider-formule');

  function majTextesFormule() {
    const p = formaterCents(reglages.prixFormuleCents);
    document.getElementById('btn-ouvrir-formule-direct').textContent = 'Composer une Formule 4 Boissons (' + p + ')';
    document.getElementById('titre-modale-formule').textContent = 'Formule 4 Boissons à ' + p;
    document.getElementById('reference-prix-formule').textContent = p;
    btnValiderFormule.textContent = 'Ajouter la formule au ticket (' + p + ')';
  }

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
    const eligibles = catalogue.filter(function (p) { return p.eligibleFormule; });
    const totalChoisi = compterTotalBoissonsFormule();

    compteurFormuleEl.textContent = totalChoisi + ' sur 4';
    btnValiderFormule.disabled = (totalChoisi !== 4);

    eligibles.forEach(function (boisson) {
      const qte = selectionFormuleEnCours[boisson.id] || 0;
      const div = h('div', 'ligne-choix-boisson');

      const divTexte = h('div');
      divTexte.appendChild(h('span', 'produit-nom', boisson.nom));
      divTexte.appendChild(h('span', 'texte-secondaire', ' (' + formaterEuros(boisson.prix) + ' hors formule)'));

      const ctrl = h('div', 'controles-choix-boisson');
      const moins = bouton('- 1', 'btn btn--secondaire', function () {
        if (selectionFormuleEnCours[boisson.id] > 0) {
          selectionFormuleEnCours[boisson.id] -= 1;
          rendreInterieurModaleFormule();
        }
      });
      moins.disabled = qte <= 0;
      const nombre = h('span', 'reference', String(qte));
      nombre.style.minWidth = '28px';
      nombre.style.textAlign = 'center';
      const plus = bouton('+ 1', 'btn btn--secondaire', function () {
        if (compterTotalBoissonsFormule() < 4) {
          selectionFormuleEnCours[boisson.id] = (selectionFormuleEnCours[boisson.id] || 0) + 1;
          rendreInterieurModaleFormule();
        }
      });
      plus.disabled = totalChoisi >= 4;
      ctrl.appendChild(moins);
      ctrl.appendChild(nombre);
      ctrl.appendChild(plus);

      div.appendChild(divTexte);
      div.appendChild(ctrl);
      listeEligiblesEl.appendChild(div);
    });
  }

  document.getElementById('btn-ouvrir-formule-direct').addEventListener('click', ouvrirModaleFormule);
  document.getElementById('btn-annuler-formule').addEventListener('click', function () { modaleFormule.hidden = true; });

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
      { id: 'formule-4-boissons', nom: 'Formule 4 Boissons', prixCents: reglages.prixFormuleCents },
      'Détail : ' + details.join(', ')
    );
    modaleFormule.hidden = true;
    afficherMessageTemporaire('Formule 4 Boissons ajoutée au ticket.', 'succes');
  });

  /* ------------------------------------------------------------------------
     12. DÉTAIL D'UN TICKET (SALLE ET RECAP)
     ------------------------------------------------------------------------ */
  const modaleTicket = document.getElementById('modale-ticket');
  const btnRouvrirTicket = document.getElementById('btn-rouvrir-ticket');

  function ligneDetail(gauche, droite, classe) {
    const d = h('div', 'detail-ligne' + (classe ? ' ' + classe : ''));
    d.appendChild(h('span', null, gauche));
    if (droite !== undefined) d.appendChild(h('span', 'chasse-fixe', droite));
    return d;
  }

  function ouvrirDetailTicket(t) {
    const corps = document.getElementById('detail-ticket-corps');
    corps.innerHTML = '';

    const statutTexte = t.statut === 'annule' ? 'Ticket annulé' :
      t.statut === 'en_cours' ? 'Ticket en cours (paiement partiel)' : 'Ticket encaissé';
    document.getElementById('titre-modale-ticket').textContent =
      (t.reference || 'Ticket') + ' — ' + t.emplacementNom;
    document.getElementById('sous-titre-modale-ticket').textContent =
      statutTexte + ' — ' + t.modeService;

    const ouvert = t.ouvertLe ? formaterDateHeure(t.ouvertLe) : (t.ouvertLeTexte || '');
    const termine = t.termineLe ? formaterDateHeure(t.termineLe) : (t.heureTexte || '');
    if (ouvert) corps.appendChild(ligneDetail('Ouvert', ouvert));
    if (termine) corps.appendChild(ligneDetail(t.statut === 'annule' ? 'Annulé' : 'Terminé', termine));

    if (t.legacy) {
      corps.appendChild(h('p', 'texte-secondaire', 'Ticket repris de l’ancien journal. Contenu : ' + (t.resume || 'non disponible') + '.'));
    }

    if (t.lignes && t.lignes.length) {
      const titre = h('h3', 'titre-bloc', 'Articles');
      titre.style.margin = '16px 0 8px';
      corps.appendChild(titre);
      t.lignes.forEach(function (l) {
        corps.appendChild(ligneDetail(l.quantite + 'x ' + l.nom, formaterCents(l.prixCents * l.quantite)));
        if (l.detail) corps.appendChild(h('p', 'texte-secondaire', l.detail));
      });
    }

    if (t.retraits && t.retraits.length) {
      const titre = h('h3', 'titre-bloc', 'Lignes retirées après coup');
      titre.style.margin = '16px 0 8px';
      corps.appendChild(titre);
      t.retraits.forEach(function (r) {
        corps.appendChild(ligneDetail(r.qte + 'x ' + r.nom + ' (à ' + formaterHeure(r.ts) + ')', formaterCents(r.prixCents * r.qte)));
      });
    }

    const total = totalTicket(t);
    const tot = ligneDetail(t.statut === 'annule' ? 'Montant annulé' : 'Total du ticket', formaterCents(total), 'detail-ligne--total');
    corps.appendChild(tot);

    if (t.paiements && t.paiements.length) {
      const titre = h('h3', 'titre-bloc', 'Paiements');
      titre.style.margin = '16px 0 8px';
      corps.appendChild(titre);
      t.paiements.forEach(function (p) {
        corps.appendChild(ligneDetail('Payé à ' + heureDe(p.ts, t.heureTexte), formaterCents(p.cents)));
      });
      if (t.statut === 'en_cours') {
        corps.appendChild(ligneDetail('Reste à régler', formaterCents(resteTicket(t)), 'detail-ligne--total'));
      }
    }

    if (t.corrections && t.corrections.length) {
      const titre = h('h3', 'titre-bloc', 'Corrections');
      titre.style.margin = '16px 0 8px';
      corps.appendChild(titre);
      t.corrections.forEach(function (c) {
        corps.appendChild(ligneDetail('Paiement annulé à ' + formaterHeure(c.ts), formaterCents(c.cents)));
      });
    }

    const peutRouvrir = t.statut === 'encaisse' && !t.legacy;
    btnRouvrirTicket.hidden = !peutRouvrir;
    btnRouvrirTicket.onclick = function () {
      modaleTicket.hidden = true;
      const dernier = t.paiements[t.paiements.length - 1];
      demanderConfirmation({
        titre: 'Rouvrir le ticket ' + t.reference + ' ?',
        consequences: 'Le dernier paiement (' + formaterCents(dernier ? dernier.cents : 0) + ') sera annulé et le ticket reviendra sur ' + t.emplacementNom + ', prêt à être encaissé de nouveau. Le total du service diminue d’autant.',
        verbeGarder: 'Laisser encaissé',
        verbeDetruire: 'Rouvrir le ticket',
        actionConfirmee: function () {
          if (rouvrirTicket(t.id)) {
            emplacementActifId = t.emplacementId;
            afficherVue('commande');
            afficherMessageTemporaire('Ticket rouvert sur ' + t.emplacementNom + '.', 'info');
          }
        }
      });
    };

    modaleTicket.hidden = false;
  }

  document.getElementById('btn-fermer-ticket').addEventListener('click', function () {
    modaleTicket.hidden = true;
  });

  /* ------------------------------------------------------------------------
     13. CLÔTURE DU SERVICE
     ------------------------------------------------------------------------ */
  function demanderClotureService() {
    const svc = serviceCourant();
    const stats = statistiquesService(svc.id);
    const ouverts = salle.filter(function (e) { return estActive(obtenirCommande(e.id)); });
    const resteOuvert = ouverts.reduce(function (a, e) { return a + resteTicket(commandes[e.id]); }, 0);

    let texte = 'Le total encaissé (' + formaterCents(stats.total) + ') repartira à 0,00 € pour le prochain service. ' +
      'Les tickets du service restent consultables dans le recap des ventes.';
    if (ouverts.length) {
      texte += ' Attention : ' + ouverts.length + ' emplacement' + (ouverts.length > 1 ? 's ont' : ' a') +
        ' encore un ticket non soldé (' + formaterCents(resteOuvert) + '). ' +
        (ouverts.length > 1 ? 'Ils restent ouverts' : 'Il reste ouvert') + ' et seront encaissés dans le prochain service.';
    }

    demanderConfirmation({
      titre: 'Clôturer le service n°' + svc.numero + ' ?',
      consequences: texte,
      verbeGarder: 'Continuer le service',
      verbeDetruire: 'Clôturer le service',
      actionConfirmee: function () {
        try {
          ecrire(CLE_SAUVEGARDE_AUTO, construireSauvegarde());
        } catch (e) { /* pas de place : on continue sans copie */ }
        svc.clotureLe = Date.now();
        svc.totalCents = totalService(svc.id);
        payees = {};
        const nouveau = serviceCourant();
        sauvegarderTout();
        serviceRecapId = svc.id;
        afficherVue('salle');
        afficherMessageTemporaire(
          'Service n°' + svc.numero + ' clôturé : ' + formaterCents(svc.totalCents) + ' encaissés. Service n°' + nouveau.numero + ' ouvert.',
          'succes'
        );
      }
    });
  }

  document.getElementById('btn-cloturer-service').addEventListener('click', demanderClotureService);

  /* ------------------------------------------------------------------------
     14. VUE 3 : RECAP DES VENTES
     ------------------------------------------------------------------------ */
  function libelleStatutEntree(e) {
    if (e.ticket.statut === 'annule') return 'annulé';
    if (e.enCours) return 'partiel';
    return '';
  }

  function rendreVueRecap() {
    const courant = serviceCourant();
    if (!serviceRecapId || !services.some(function (s) { return s.id === serviceRecapId; })) {
      serviceRecapId = courant.id;
    }

    // Liste des services
    const listeEl = document.getElementById('liste-services');
    listeEl.innerHTML = '';
    services.slice().sort(function (a, b) { return b.numero - a.numero; }).forEach(function (svc) {
      const stats = statistiquesService(svc.id);
      const li = h('li', 'ligne-registre' + (svc.id === serviceRecapId ? ' ligne-registre--selection' : ''));
      li.style.gridTemplateColumns = '1.6fr 1.4fr auto auto';

      const nom = h('div');
      nom.appendChild(h('span', 'cellule-nom', 'Service n°' + svc.numero));
      nom.appendChild(h('span', 'statut-temps', svc.clotureLe ? '' : ' en cours'));
      li.appendChild(nom);

      let periode;
      if (!svc.ouvertLe) periode = 'Repris de l’ancien journal' + (svc.clotureLe ? ', clos ' + formaterDateHeure(svc.clotureLe) : '');
      else periode = formaterDateHeure(svc.ouvertLe) + (svc.clotureLe ? ' → ' + formaterDateHeure(svc.clotureLe) : ' → maintenant');
      li.appendChild(h('div', 'cellule-apercu', periode + ' — ' + stats.nbTickets + ' ticket' + (stats.nbTickets > 1 ? 's' : '')));
      li.appendChild(h('div', 'cellule-montant', formaterCents(stats.total)));
      li.appendChild(bouton(svc.id === serviceRecapId ? 'Affiché' : 'Voir le détail',
        svc.id === serviceRecapId ? 'btn btn--principal' : 'btn btn--secondaire',
        function () { serviceRecapId = svc.id; rendreVueRecap(); }));
      listeEl.appendChild(li);
    });

    rendreDetailService();
  }

  function rendreDetailService() {
    const svc = services.find(function (s) { return s.id === serviceRecapId; });
    const estCourant = !svc.clotureLe;
    const stats = statistiquesService(svc.id);

    document.getElementById('titre-detail-service').textContent =
      'Détail du service n°' + svc.numero + (estCourant ? ' (en cours)' : '');

    const grille = document.getElementById('stats-service');
    grille.innerHTML = '';
    function bloc(libelle, valeur) {
      const b = h('div', 'stat-bloc');
      b.appendChild(h('span', 'stat-libelle', libelle));
      b.appendChild(h('span', 'stat-valeur', valeur));
      grille.appendChild(b);
    }
    bloc('Total encaissé', formaterCents(stats.total));
    bloc('Tickets encaissés', String(stats.nbTickets));
    bloc('Ticket moyen', formaterCents(stats.panierMoyen));
    bloc('Tickets annulés', stats.nbAnnules + (stats.nbAnnules ? ' (' + formaterCents(stats.montantAnnule) + ')' : ''));

    const topEl = document.getElementById('liste-top-produits');
    topEl.innerHTML = '';
    if (stats.top.length === 0) {
      const li = h('li');
      li.style.padding = '16px 24px';
      li.appendChild(h('span', 'texte-secondaire', 'Aucun produit vendu dans ce service.'));
      topEl.appendChild(li);
    } else {
      stats.top.slice(0, 12).forEach(function (p) {
        const li = h('li', 'ligne-registre');
        li.style.gridTemplateColumns = '1fr auto auto';
        li.style.minHeight = '48px';
        li.appendChild(h('div', 'cellule-nom', p.nom));
        li.appendChild(h('div', 'cellule-apercu', p.qte + ' vendu' + (p.qte > 1 ? 's' : '')));
        li.appendChild(h('div', 'cellule-montant', formaterCents(p.cents)));
        topEl.appendChild(li);
      });
    }
    const note = document.getElementById('note-sans-detail');
    note.hidden = stats.nbSansDetail === 0;
    note.textContent = stats.nbSansDetail + ' ticket' + (stats.nbSansDetail > 1 ? 's' : '') +
      ' repris de l’ancien journal ne figure' + (stats.nbSansDetail > 1 ? 'nt' : '') + ' pas dans ce classement (détail non conservé), mais sont bien dans les totaux.';

    const tkEl = document.getElementById('liste-tickets-service');
    tkEl.innerHTML = '';
    const entrees = entreesService(svc.id);
    if (entrees.length === 0) {
      const li = h('li');
      li.style.padding = '16px 24px';
      li.appendChild(h('span', 'texte-secondaire', 'Aucun ticket dans ce service pour le moment.'));
      tkEl.appendChild(li);
    }
    entrees.forEach(function (e) {
      const t = e.ticket;
      const li = h('li', 'ligne-registre');
      li.style.gridTemplateColumns = '1.2fr 2fr auto auto';

      const nom = h('div');
      nom.appendChild(h('span', 'cellule-nom', t.emplacementNom));
      const quand = e.ts ? formaterDateHeure(e.ts) : heureDe(null, t.heureTexte);
      nom.appendChild(h('span', 'statut-temps', ' ' + quand));
      const etiq = libelleStatutEntree(e);
      if (etiq) {
        const s = h('span', t.statut === 'annule' ? 'tag-annule' : 'statut-temps', ' ' + etiq);
        nom.appendChild(s);
      }
      li.appendChild(nom);
      li.appendChild(h('div', 'cellule-apercu', (t.reference || '') + ' — ' + resumeLignes(t)));
      li.appendChild(h('div', 'cellule-montant', t.statut === 'annule' ? '(' + formaterCents(totalTicket(t)) + ')' : formaterCents(e.cents)));
      li.appendChild(bouton('Détail', 'btn btn--discret', function () { ouvrirDetailTicket(t); }));
      tkEl.appendChild(li);
    });

    const zoneActions = document.getElementById('actions-detail-service');
    zoneActions.innerHTML = '';
    zoneActions.appendChild(bouton('Exporter ce service (CSV)', 'btn btn--secondaire', function () { exporterCsvService(svc); }));
    if (estCourant) {
      zoneActions.appendChild(bouton('Clôturer le service', 'btn btn--principal', demanderClotureService));
    } else {
      zoneActions.appendChild(bouton('Supprimer ce service', 'btn btn--danger', function () { demanderSuppressionService(svc); }));
    }
  }

  function demanderSuppressionService(svc) {
    const bloque = Object.keys(commandes).some(function (k) {
      return commandes[k].paiements.some(function (p) { return p.serviceId === svc.id; });
    });
    if (bloque) {
      afficherBandeauAlerte('Suppression impossible.', 'Un ticket encore ouvert contient des paiements de ce service. Terminez-le d’abord.');
      return;
    }
    const nb = tickets.filter(function (t) { return t.serviceId === svc.id; }).length;
    demanderConfirmation({
      titre: 'Supprimer le service n°' + svc.numero + ' ?',
      consequences: 'Ce service et ses ' + nb + ' ticket' + (nb > 1 ? 's' : '') + ' seront définitivement supprimés du recap. Pensez à exporter le CSV avant si vous en avez besoin.',
      verbeGarder: 'Garder le service',
      verbeDetruire: 'Supprimer le service',
      actionConfirmee: function () {
        tickets = tickets.filter(function (t) { return t.serviceId !== svc.id; });
        tickets.forEach(function (t) {
          t.paiements = t.paiements.filter(function (p) { return p.serviceId !== svc.id; });
        });
        services = services.filter(function (s) { return s.id !== svc.id; });
        Object.keys(payees).forEach(function (k) {
          if (!tickets.some(function (t) { return t.id === payees[k].ticketId; })) delete payees[k];
        });
        serviceRecapId = null;
        sauvegarderTout();
        rendreVueRecap();
        afficherMessageTemporaire('Service supprimé.', 'info');
      }
    });
  }

  /* ------------------------------------------------------------------------
     15. EXPORTS ET SAUVEGARDE
     ------------------------------------------------------------------------ */
  function telecharger(nomFichier, contenu, type) {
    const blob = new Blob([contenu], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  function csvCellule(v) {
    return '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"';
  }

  function dateFichier() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function exporterCsvService(svc) {
    const lignes = [['Service', 'Date', 'Heure', 'Emplacement', 'Référence', 'Mode', 'Statut', 'Articles', 'Montant encaissé (€)']];
    entreesService(svc.id).forEach(function (e) {
      const t = e.ticket;
      lignes.push([
        'Service ' + svc.numero,
        e.ts ? formaterDate(e.ts) : '',
        e.ts ? formaterHeure(e.ts) : heureDe(null, t.heureTexte),
        t.emplacementNom,
        t.reference || '',
        t.modeService,
        t.statut === 'annule' ? 'annulé' : (e.enCours ? 'partiel' : 'encaissé'),
        resumeLignes(t),
        (e.cents / 100).toFixed(2).replace('.', ',')
      ]);
    });
    lignes.push(['Total', '', '', '', '', '', '', '', (totalService(svc.id) / 100).toFixed(2).replace('.', ',')]);
    const contenu = '﻿' + lignes.map(function (l) { return l.map(csvCellule).join(';'); }).join('\r\n');
    telecharger('escale241-service-' + svc.numero + '-' + dateFichier() + '.csv', contenu, 'text/csv;charset=utf-8');
    afficherMessageTemporaire('Export du service n°' + svc.numero + ' téléchargé.', 'succes');
  }

  function construireSauvegarde() {
    const donnees = {};
    Object.keys(CLES).forEach(function (k) {
      donnees[CLES[k]] = {
        CATALOGUE: catalogue, SALLE: salle, COMPTEUR_REF: compteurRef, COMMANDES: commandes,
        TICKETS: tickets, SERVICES: services, PAYEES: payees, REGLAGES: reglages
      }[k];
    });
    return { format: 'escale241-sauvegarde', version: 2, creeLe: Date.now(), donnees: donnees };
  }

  function exporterSauvegarde() {
    telecharger('escale241-sauvegarde-' + dateFichier() + '.json', JSON.stringify(construireSauvegarde()), 'application/json');
    afficherMessageTemporaire('Sauvegarde téléchargée. Gardez-la en lieu sûr (mail, cloud).', 'succes');
  }

  function importerSauvegarde(fichier) {
    const lecteur = new FileReader();
    lecteur.onload = function () {
      let contenu;
      try {
        contenu = JSON.parse(String(lecteur.result));
        if (!contenu || contenu.format !== 'escale241-sauvegarde' || !contenu.donnees) throw new Error('format');
        const d = contenu.donnees;
        if (!Array.isArray(d[CLES.CATALOGUE]) || !Array.isArray(d[CLES.SALLE]) || !Array.isArray(d[CLES.TICKETS]) ||
            !Array.isArray(d[CLES.SERVICES]) || typeof d[CLES.COMMANDES] !== 'object') throw new Error('contenu');
      } catch (e) {
        afficherBandeauAlerte('Fichier non reconnu.', 'Choisissez un fichier de sauvegarde exporté depuis cette appli (escale241-sauvegarde-….json).');
        return;
      }
      demanderConfirmation({
        titre: 'Restaurer cette sauvegarde ?',
        consequences: 'Toutes les données actuelles de la tablette (carte, tickets, services) seront remplacées par celles du fichier' +
          (contenu.creeLe ? ' (créé le ' + formaterDateHeure(contenu.creeLe) + ')' : '') + '. Une copie de l’état actuel est gardée de côté.',
        verbeGarder: 'Garder mes données',
        verbeDetruire: 'Restaurer la sauvegarde',
        actionConfirmee: function () {
          try {
            ecrire('escale_sauvegarde_avant_import', construireSauvegarde());
          } catch (e) { /* pas de place : on continue */ }
          try {
            Object.keys(contenu.donnees).forEach(function (cle) {
              if (cle.indexOf('escale_') === 0) ecrire(cle, contenu.donnees[cle]);
            });
            localStorage.setItem(CLE_VERSION, '2');
          } catch (e) {
            afficherBandeauAlerte('Restauration impossible.', 'La tablette n’a pas assez d’espace disponible.');
            return;
          }
          window.location.reload();
        }
      });
    };
    lecteur.readAsText(fichier);
  }

  document.getElementById('btn-exporter-sauvegarde').addEventListener('click', exporterSauvegarde);
  document.getElementById('champ-import-sauvegarde').addEventListener('change', function (e) {
    const f = e.target.files && e.target.files[0];
    if (f) importerSauvegarde(f);
    e.target.value = '';
  });

  /* ------------------------------------------------------------------------
     16. VUE 4 : ADMINISTRATION (CARTE, SALLE, RÉGLAGES, SAUVEGARDE)
     ------------------------------------------------------------------------ */
  function rendreVueAdmin() {
    document.getElementById('champ-prix-formule').value = (reglages.prixFormuleCents / 100).toFixed(2).replace('.', ',');
    rendreAdminCatalogue();
    rendreAdminSalle();
  }

  function rendreAdminCatalogue() {
    const conteneur = document.getElementById('liste-admin-catalogue');
    conteneur.innerHTML = '';

    catalogue.forEach(function (item) {
      const ligne = h('div', 'ligne-admin-catalogue');

      const divInfos = h('div');
      divInfos.appendChild(h('div', 'cellule-nom', item.nom));
      divInfos.appendChild(h('div', 'texte-secondaire',
        item.categorie + (item.eligibleFormule ? ' — Éligible Formule ' + formaterCents(reglages.prixFormuleCents) : '')));

      const divPrix = h('div', 'groupe-prix-inline');
      const inputPrix = h('input', 'champ-prix-inline');
      inputPrix.type = 'text';
      inputPrix.inputMode = 'decimal';
      inputPrix.setAttribute('aria-label', 'Prix en euros pour ' + item.nom);
      inputPrix.value = Number(item.prix).toFixed(2).replace('.', ',');
      divPrix.appendChild(inputPrix);
      divPrix.appendChild(bouton('Modifier le prix', 'btn btn--secondaire', function () {
        const cents = lireMontantSaisi(inputPrix.value);
        if (cents === null) {
          afficherBandeauAlerte('Prix invalide.', 'Saisissez un montant supérieur à 0 € pour ' + item.nom + ' (exemple : 3,50).');
          return;
        }
        item.prix = cents / 100;
        sauvegarderTout();
        rendreAdminCatalogue();
        afficherMessageTemporaire('Prix modifié pour ' + item.nom + ' (' + formaterCents(cents) + ').', 'succes');
      }));

      const btnToggle = bouton(
        item.eligibleFormule ? 'Retirer de la Formule' : 'Inclure dans la Formule',
        'btn btn--discret',
        function () {
          item.eligibleFormule = !item.eligibleFormule;
          sauvegarderTout();
          rendreAdminCatalogue();
        });

      const btnRetirer = bouton('Retirer de la carte', 'btn btn--danger', function () {
        const copie = Object.assign({}, item);
        const indexOriginal = catalogue.findIndex(function (p) { return p.id === item.id; });
        catalogue = catalogue.filter(function (p) { return p.id !== item.id; });
        sauvegarderTout();
        rendreAdminCatalogue();
        afficherMessageTemporaire('Produit retiré de la carte (' + copie.nom + ').', 'info', function () {
          catalogue.splice(indexOriginal, 0, copie);
          sauvegarderTout();
          rendreAdminCatalogue();
        });
      });

      ligne.appendChild(divInfos);
      ligne.appendChild(divPrix);
      ligne.appendChild(btnToggle);
      ligne.appendChild(btnRetirer);
      conteneur.appendChild(ligne);
    });
  }

  document.getElementById('form-ajout-produit').addEventListener('submit', function (e) {
    e.preventDefault();
    const champNom = document.getElementById('champ-nom-produit');
    const champPrix = document.getElementById('champ-prix-produit');
    const champCategorie = document.getElementById('champ-categorie-produit');
    const champEligible = document.getElementById('champ-eligible-formule');
    const erreurNom = document.getElementById('erreur-nom-produit');
    const erreurPrix = document.getElementById('erreur-prix-produit');

    const nom = champNom.value.trim();
    const cents = lireMontantSaisi(champPrix.value);

    let erreur = false;
    champNom.classList.toggle('en-erreur', !nom);
    erreurNom.hidden = !!nom;
    if (!nom) erreur = true;
    champPrix.classList.toggle('en-erreur', cents === null);
    erreurPrix.hidden = cents !== null;
    if (cents === null) erreur = true;
    if (erreur) return;

    const nouveau = {
      id: uid('prod'),
      nom: nom,
      prix: cents / 100,
      categorie: champCategorie.value,
      eligibleFormule: champEligible.checked
    };
    catalogue.unshift(nouveau);
    sauvegarderTout();
    champNom.value = '';
    champPrix.value = '';
    champEligible.checked = false;
    rendreAdminCatalogue();
    afficherMessageTemporaire('Produit ajouté à la carte (' + nouveau.nom + ').', 'succes');
  });

  document.getElementById('form-prix-formule').addEventListener('submit', function (e) {
    e.preventDefault();
    const cents = lireMontantSaisi(document.getElementById('champ-prix-formule').value);
    if (cents === null) {
      afficherBandeauAlerte('Prix invalide.', 'Saisissez un montant supérieur à 0 € pour la Formule (exemple : 10).');
      return;
    }
    reglages.prixFormuleCents = cents;
    sauvegarderTout();
    majTextesFormule();
    rendreAdminCatalogue();
    afficherMessageTemporaire('Prix de la Formule : ' + formaterCents(cents) + '. Les tickets déjà ouverts gardent l’ancien prix.', 'succes');
  });

  function prochainNumero(type, prefixe) {
    let max = 0;
    salle.forEach(function (e) {
      if (e.type !== type) return;
      const m = String(e.nom).match(/(\d+)\s*$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1;
  }

  function rendreAdminSalle() {
    const listeEl = document.getElementById('liste-admin-salle');
    listeEl.innerHTML = '';

    salle.forEach(function (emp, index) {
      const cmd = obtenirCommande(emp.id);
      const statutInfo = obtenirStatutLisible(cmd, emp.id);

      const li = h('li', 'ligne-registre');
      li.style.gridTemplateColumns = '1.2fr 1.5fr auto';
      li.appendChild(h('div', 'cellule-nom', emp.nom));

      const divStatut = h('div', 'statut-ligne');
      divStatut.appendChild(h('span', 'statut-mot ' + statutInfo.classeTon, statutInfo.mot));
      divStatut.appendChild(h('span', 'statut-temps', statutInfo.repereTemps));
      li.appendChild(divStatut);

      const divAction = h('div', 'cellule-action');
      divAction.appendChild(bouton('Supprimer l’emplacement', 'btn btn--danger', function () {
        if (estActive(cmd)) {
          afficherBandeauAlerte(
            'Suppression impossible.',
            emp.nom + ' possède un ticket actif (' + formaterCents(resteTicket(cmd)) + '). Encaissez ou videz le ticket avant de supprimer cet emplacement.',
            'Ouvrir le ticket de ' + emp.nom,
            function () { emplacementActifId = emp.id; afficherVue('commande'); }
          );
          return;
        }
        const copie = Object.assign({}, emp);
        const marque = payees[emp.id];
        delete payees[emp.id];
        salle.splice(index, 1);
        if (emplacementActifId === emp.id) emplacementActifId = salle.length > 0 ? salle[0].id : null;
        sauvegarderTout();
        rendreAdminSalle();
        afficherMessageTemporaire('Emplacement supprimé (' + copie.nom + ').', 'info', function () {
          salle.splice(index, 0, copie);
          if (marque) payees[copie.id] = marque;
          sauvegarderTout();
          rendreAdminSalle();
        });
      }));
      li.appendChild(divAction);
      listeEl.appendChild(li);
    });
  }

  document.getElementById('btn-ajouter-table-auto').addEventListener('click', function () {
    const nouvel = { id: uid('table'), nom: 'Table ' + prochainNumero('table'), type: 'table' };
    salle.push(nouvel);
    sauvegarderTout();
    rendreAdminSalle();
    afficherMessageTemporaire('Table ajoutée (' + nouvel.nom + ').', 'succes');
  });

  document.getElementById('btn-ajouter-comptoir-auto').addEventListener('click', function () {
    const nouvel = { id: uid('comptoir'), nom: 'Comptoir ' + prochainNumero('comptoir'), type: 'comptoir' };
    salle.push(nouvel);
    sauvegarderTout();
    rendreAdminSalle();
    afficherMessageTemporaire('Place au comptoir ajoutée (' + nouvel.nom + ').', 'succes');
  });

  document.getElementById('form-ajout-emplacement-libre').addEventListener('submit', function (e) {
    e.preventDefault();
    const champ = document.getElementById('champ-nom-emplacement');
    const nom = champ.value.trim();
    if (!nom) return;
    const nouvel = {
      id: uid('emp'),
      nom: nom,
      type: nom.toLowerCase().indexOf('comptoir') !== -1 ? 'comptoir' : 'table'
    };
    salle.push(nouvel);
    champ.value = '';
    sauvegarderTout();
    rendreAdminSalle();
    afficherMessageTemporaire('Emplacement créé (' + nouvel.nom + ').', 'succes');
  });

  /* ------------------------------------------------------------------------
     17. SERVICE WORKER ET DÉMARRAGE
     ------------------------------------------------------------------------ */
  if ('serviceWorker' in navigator) {
    const avaitControleur = !!navigator.serviceWorker.controller;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* hors-ligne local */ });
    });
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (avaitControleur) {
        afficherMessageTemporaire('Nouvelle version de l’appli prête : fermez puis rouvrez-la pour en profiter.', 'info');
      }
    });
  }

  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  } catch (e) { /* facultatif */ }

  serviceCourant();
  sauvegarderTout();
  majTextesFormule();
  rendreVueSalle();

  if (alertesDemarrage.length) {
    afficherBandeauAlerte(
      'Des données étaient illisibles.',
      'Elles ont été mises de côté et non effacées (' + alertesDemarrage.length + ' élément' + (alertesDemarrage.length > 1 ? 's' : '') +
      '). Si besoin, restaurez une sauvegarde depuis « Gérer la carte et la salle ».'
    );
  }
})();
