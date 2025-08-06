# Documentation - Créer un document Word

## Vue d'ensemble

La fonctionnalité "Créer un document Word" permet aux utilisateurs de générer des documents médicaux directement dans l'application PediTrack. Cette fonctionnalité utilise l'éditeur de texte riche `react-draft-wysiwyg` pour offrir une expérience d'édition avancée avec export en PDF, DOCX et TXT.

## Fonctionnalités principales

### 1. Éditeur de texte riche
- **Interface intuitive** : Éditeur WYSIWYG avec barre d'outils complète
- **Formatage avancé** : Gras, italique, souligné, barré
- **Hiérarchie des titres** : H1, H2, H3, H4, H5, H6
- **Listes** : Listes à puces et numérotées
- **Alignement** : Gauche, centre, droite, justifié
- **Liens** : Insertion et gestion de liens
- **Emojis** : Support des emojis pour enrichir le contenu

### 2. Export multi-format
- **PDF** : Export en format PDF avec mise en page professionnelle
- **DOCX** : Export en format Word compatible avec Microsoft Office
- **TXT** : Export en texte brut pour compatibilité maximale

### 3. Stockage local avec nommage intelligent
- **Dossier de stockage** : `src/data/documents/`
- **Convention de nommage** : `{patientId}_{date}_{timestamp}_{titre}.{extension}`
- **Exemple** : `patient123_2024-01-15_1705312345678_Consultation_Medicale.txt`
- **Sauvegarde automatique** : localStorage + système de fichiers
- **Synchronisation** : Tentative de sauvegarde serveur si disponible

## Comment utiliser la fonctionnalité

### 1. Accéder à la création de document
- Naviguez vers la page de détail d'un patient
- Cliquez sur l'onglet "Documents"
- Cliquez sur le bouton "Créer un document Word"

### 2. Remplir le formulaire
- **Titre du document** : Nom descriptif du document
- **Type de document** : Consultation, Prescription, Vaccination, etc.
- **Nom du patient** : Automatiquement rempli
- **Date** : Date de création (modifiable)

### 3. Éditer le contenu
- Utilisez la barre d'outils pour formater le texte
- Ajoutez des titres, listes, et alignements
- Voir l'aperçu en temps réel

### 4. Sauvegarder et exporter
- **Sauvegarder dans l'historique** : Stocke le document localement
- **Télécharger TXT** : Export en texte brut
- **Télécharger PDF** : Export en PDF
- **Télécharger DOCX** : Export en Word

## Structure de stockage

### Fichiers locaux
```
src/data/documents/
├── .gitkeep
├── README.md
└── {patientId}_{timestamp}_{title}.{ext}
```

### Métadonnées localStorage
- Titre du document
- Type de document
- ID du patient
- Contenu complet
- Date de création
- Taille du fichier
- Chemin local

## Gestion des erreurs

### Erreurs d'éditeur
- **Initialisation** : Délai de 200ms pour assurer la stabilité
- **État corrompu** : Réinitialisation automatique
- **Focus** : Gestion robuste des événements de focus

### Erreurs de sauvegarde
- **Serveur indisponible** : Sauvegarde locale uniquement
- **Espace insuffisant** : Notification d'erreur
- **Format invalide** : Validation avant sauvegarde

## API et services

### LocalDocumentService
- `saveDocumentLocally()` : Sauvegarde locale
- `generateFileName()` : Génération du nom de fichier
- `getLocalDocuments()` : Récupération des documents locaux
- `deleteLocalDocument()` : Suppression locale

### DocumentService
- `uploadWordTemplate()` : Upload avec fallback local
- `getDocuments()` : Fusion local + serveur
- `deleteDocument()` : Suppression hybride
- `downloadDocument()` : Téléchargement adaptatif

## Sécurité et performance

### Sécurité
- **Validation des entrées** : Nettoyage des noms de fichiers
- **Isolation** : Documents séparés par patient
- **Backup** : Double sauvegarde (fichier + localStorage)

### Performance
- **Lazy loading** : Chargement différé de l'éditeur
- **Mise en cache** : localStorage pour accès rapide
- **Optimisation** : Éviter les re-renders inutiles

## Maintenance

### Nettoyage
- Suppression automatique des fichiers temporaires
- Gestion de l'espace localStorage
- Archivage des anciens documents

### Migration
- Support de l'import/export de documents
- Migration des formats de fichiers
- Rétrocompatibilité des métadonnées 