# Firestore setup

The app reads the `monitorias` collection in real time and lets signed-in
institutional users add documents from the **Adicionar** button. It does not
edit or delete documents. Sign in with an institutional account, then use
Firebase Console to create the collection and any initial documents.

## Document fields

Every document must have:

| Field | Type | Example |
|---|---|---|
| `nome` | string | `Cálculo I` |
| `dia` | string | `Quarta-feira` |
| `horario` | string | `19:40` |
| `sala` | string | `B205` |
| `monitor` | string | `Rogerio` |
| `area` | string | `Matemática` |
| `ordem` | number | `1` |

## Sample documents

In Firebase Console, open **Firestore Database → Data**, create a collection
named `monitorias`, then create one document per ID below using the field values.
The first three entries follow the attached design; the last three are additional
sample entries.

```json
{
  "calculo-i": {
    "nome": "Cálculo I",
    "dia": "Quarta-feira",
    "horario": "19:40",
    "sala": "B205",
    "monitor": "Rogerio",
    "area": "Matemática",
    "ordem": 1
  },
  "algebra-linear": {
    "nome": "Álgebra Linear",
    "dia": "Terça-feira",
    "horario": "19:40",
    "sala": "B287",
    "monitor": "Rogerio",
    "area": "Matemática",
    "ordem": 2
  },
  "geometria-analitica": {
    "nome": "Geometria Analítica",
    "dia": "Sexta-feira",
    "horario": "19:40",
    "sala": "B205",
    "monitor": "Rogerio",
    "area": "Matemática",
    "ordem": 3
  },
  "matematica-basica": {
    "nome": "Matemática Básica",
    "dia": "Segunda-feira",
    "horario": "18:00",
    "sala": "B204",
    "monitor": "Ana Paula",
    "area": "Matemática",
    "ordem": 4
  },
  "fisica-i": {
    "nome": "Física I",
    "dia": "Quinta-feira",
    "horario": "20:30",
    "sala": "B207",
    "monitor": "Marcos",
    "area": "Física",
    "ordem": 5
  },
  "estatistica-aplicada": {
    "nome": "Estatística Aplicada",
    "dia": "Quarta-feira",
    "horario": "18:00",
    "sala": "B210",
    "monitor": "Camila",
    "area": "Matemática",
    "ordem": 6
  }
}
```

The last three records are examples only; confirm their schedule and monitor
details before treating them as actual IFTM offerings.

## Security rules

Publish these rules in **Firestore Database → Rules**. They let signed-in users with either institutional email domain read and create
valid monitorias, while denying client updates and deletes. Existing entries can
still be edited or removed in Firebase Console.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /monitorias/{monitoriaId} {
      allow read: if request.auth != null
        && request.auth.token.email is string
        && (
          request.auth.token.email.matches('.*@estudante[.]iftm[.]edu[.]br$')
          || request.auth.token.email.matches('.*@iftm[.]edu[.]br$')
        );
      allow create: if request.auth != null
        && request.auth.token.email is string
        && (
          request.auth.token.email.matches('.*@estudante[.]iftm[.]edu[.]br$')
          || request.auth.token.email.matches('.*@iftm[.]edu[.]br$')
        )
        && request.resource.data.keys().hasAll([
          'nome', 'dia', 'horario', 'sala', 'monitor', 'area', 'ordem'
        ])
        && request.resource.data.keys().hasOnly([
          'nome', 'dia', 'horario', 'sala', 'monitor', 'area', 'ordem'
        ])
        && request.resource.data.nome is string
        && request.resource.data.dia is string
        && request.resource.data.horario is string
        && request.resource.data.sala is string
        && request.resource.data.monitor is string
        && request.resource.data.area is string
        && request.resource.data.ordem is number
        && request.resource.data.ordem > 0;
      allow update, delete: if false;
    }
  }
}
```

Publish these updated rules in Firebase Console before using the in-app form.
