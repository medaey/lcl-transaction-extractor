# LCL — Extrait d'Opérations Bancaires (Extension Chrome)

Extension Chrome / Edge / Brave permettant d'extraire automatiquement et de structurer l'historique de vos opérations bancaires depuis votre espace client **LCL**.

<p align="center">
  <img src="preview.png" alt="Aperçu de l'extension LCL" width="800"/>
</p>

---

## 🚀 Fonctionnalités

- **Découpage automatique par mois** : Récupère les vrais titres des mois via les balises de la page.
- **Interface moderne avec onglets** : Naviguez d'un mois à l'autre en un clic.
- **Affichage clair** : Distinction automatique des débits (en rouge) et des crédits (en vert).
- **Copie au presse-papiers** : Copiez facilement la liste du mois sélectionné pour la coller dans Excel ou votre gestionnaire de comptes.

---

## 📂 Structure de l'extension

```text
├── manifest.json   # Configuration du Manifest V3
├── popup.html      # Interface utilisateur de l'extension
├── popup.js        # Script d'extraction et logique de l'interface
└── README.md       # Guide d'utilisation et d'installation
```

---

## 🛠️ Installation dans Chrome / Brave / Edge

1. **Téléchargez & Dézippez** l'archive `.zip` dans un dossier de votre choix.
2. Ouvrez votre navigateur et allez sur `chrome://extensions/`.
3. Activez le **Mode développeur** (interrupteur en haut à droite).
4. Cliquez sur **Charger l'extension non empaquetée** (en haut à gauche).
5. Sélectionnez **le dossier dézippé** (qui contient directement le fichier `manifest.json`).

---

## 📖 Utilisation

1. Connectez-vous à votre espace bancaire **LCL** et rendez-vous sur la page du détail de votre compte.
2. Cliquez sur l'icône de l'extension **LCL Extractions** dans la barre d'outils du navigateur.
3. Cliquez sur **Extraire tout**.
4. Naviguez entre les différents mois grâce aux onglets générés.
5. Cliquez sur **Copier** pour placer la liste des montants du mois sélectionné dans votre presse-papiers.

---

## 🔍 XPath Utilisés

- **Titres des mois** :  
  `//*[@id="main-content"]/app-account-details-page/div[1]/ui-transaction-list/h2[X]/span/span`
- **Conteneurs des opérations** :  
  `//*[@id="main-content"]/app-account-details-page/div[1]/ui-transaction-list/ul`
- **Montants des transactions** :  
  `.//li/ui-transaction-item/button/span[1]/span[4]/span`
