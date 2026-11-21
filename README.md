# La porte de Mes Conserves

Ce dépôt ne contient **pas** l'application. Il contient une seule page, qui sert
de porte d'entrée : une adresse qui ne change jamais, et qui renvoie vers
l'ordinateur de la maison là où il se trouve aujourd'hui.

- `index.html` : la porte. Elle lit `lien.json` et vous y emmène.
- `lien.json` : l'adresse du moment. Écrite par `tools/porte.ps1`, dans le dépôt
  privé de l'application, chaque fois que la porte est ouverte. `"url": ""`
  signifie que la réserve est fermée.

L'adresse universelle : <https://samrtauet-sketch.github.io/conserves/>

Les bocaux, les comptes et les mots de passe ne quittent jamais l'ordinateur de
la maison. Cette page ne sait que l'adresse, et le code d'accès reste demandé à
l'arrivée.

## Vérifier la porte

```
node essai.js
```

Onze vérifications dans un vrai navigateur (Chrome, par le protocole DevTools) : l'état
fermé, l'état ouvert et le renvoi automatique, et trois adresses douteuses qui doivent être
refusées. Le test sert cette page sur un port local et lui présente tour à tour chaque
`lien.json`. Il a besoin de `tests/lib.js`, qui vit dans le dépôt privé de l'application.
