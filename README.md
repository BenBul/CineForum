# CineForum - Sistemos Aprašymas

## 1. Sistemos Paskirtis

CineForum yra web platforma, skirta TV serialų gerbėjų bendruomenei. Sistema leidžia vartotojams naršyti, vertinti ir aptarti televizijos serialus, jų sezonus bei atskirus epizodus. Platforma suteikia galimybę kurti turinio katalogą, dalintis nuomonėmis ir vertinimais, bei organizuoti diskusijas apie mėgstamus serialus.

Sistema užtikrina turinio valdymą pagal vartotojo vaidmenį (svečias, registruotas vartotojas, administratorius), leidžianti skirtingą prieigos lygį prie funkcijų. Vartotojai gali peržiūrėti serialų informaciją, skaityti kitų atsiliepimus, o prisiregistravę - patys prisidėti prie turinio kūrimo ir aptarimo.

**Pagrindinės sistemos funkcijos:**
- Serialų, sezonų ir epizodų katalogo valdymas
- Vartotojų atsiliepimų ir vertinimų sistema (1-5 žvaigždutės)
- Paieškos funkcionalumas
- Vaidmenų pagrindu veikianti prieigos kontrolė
- Atsakanti (responsive) svetainės sąsaja, pritaikyta mobiliesiems ir stalinių kompiuterių įrenginiams

---

## 2. Funkciniai Reikalavimai Pagal Vaidmenis

### 2.1. Svečias (Guest)

**Svečias** - neprisiregistravęs sistemos lankytojas, turintis apribotą prieigą tik peržiūros funkcijoms.

#### Leidžiamos funkcijos:
- ✅ Peržiūrėti visų serialų sąrašą
- ✅ Peržiūrėti serialo detales (pavadinimas, nuotrauka)
- ✅ Peržiūrėti serialo sezonus
- ✅ Peržiūrėti sezono epizodus
- ✅ Peržiūrėti epizodo detales
- ✅ Skaityti visus vartotojų komentarus ir vertinimus
- ✅ Naudoti serialų paieškos funkciją
- ✅ Naršyti po visą svetainę be autentifikacijos

#### Draudžiamos funkcijos:
- ❌ Kurti naujus serialus, sezonus ar epizodus
- ❌ Rašyti komentarus ar vertinimus
- ❌ Redaguoti bet kokį turinį
- ❌ Trinti bet kokį turinį

---

### 2.2. Registruotas Vartotojas (User)

**Registruotas vartotojas** - prisiregistravęs ir prisijungęs sistemos narys, galintis aktyviai dalyvauti turinio kūrime ir aptarime.

#### Leidžiamos funkcijos:

**Peržiūra (paveldėta iš svečio):**
- ✅ Visos svečio peržiūros funkcijos

**Turinio kūrimas:**
- ✅ Kurti naujus serialus (pavadinimas, nuotrauka)
- ✅ Kurti naujus sezonus esamiems serialams
- ✅ Kurti naujus epizodus esamiems sezonams
- ✅ Rašyti komentarus serialams, sezonams ir epizodams
- ✅ Vertinti serialus, sezonus ir epizodus (1-5 žvaigždutės)

**Savo turinio redagavimas:**
- ✅ Redaguoti savo sukurtus serialus
- ✅ Redaguoti savo sukurtus sezonus
- ✅ Redaguoti savo sukurtus epizodus
- ✅ Redaguoti savo parašytus komentarus
- ✅ Keisti savo suteiktus vertinimus

**Savo turinio trynimas:**
- ✅ Trinti savo sukurtus serialus
- ✅ Trinti savo sukurtus sezonus
- ✅ Trinti savo sukurtus epizodus
- ✅ Trinti savo komentarus

#### Draudžiamos funkcijos:
- ❌ Redaguoti kitų vartotojų sukurtą turinį
- ❌ Trinti kitų vartotojų sukurtą turinį
- ❌ Redaguoti kitų vartotojų komentarus
- ❌ Trinti kitų vartotojų komentarus
- ❌ Keisti kitų vartotojų vaidmenis
- ❌ Valdyti sistemos nustatymus

---

### 2.3. Administratorius (Admin)

**Administratorius** - sistemos valdytojas su visomis teisėmis, atsakingas už turinio moderavimą ir sistemos administravimą.

#### Leidžiamos funkcijos:

**Visos vartotojo funkcijos:**
- ✅ Visos registruoto vartotojo funkcijos

**Bet kokio turinio valdymas:**
- ✅ Redaguoti BET KOKĮ serialą (nepriklausomai nuo kūrėjo)
- ✅ Redaguoti BET KOKĮ sezoną (nepriklausomai nuo kūrėjo)
- ✅ Redaguoti BET KOKĮ epizodą (nepriklausomai nuo kūrėjo)
- ✅ Redaguoti BET KOKĮ komentarą (nepriklausomai nuo autoriaus)

**Bet kokio turinio trynimas:**
- ✅ Trinti BET KOKĮ serialą
- ✅ Trinti BET KOKĮ sezoną
- ✅ Trinti BET KOKĮ epizodą
- ✅ Trinti BET KOKĮ komentarą
- ✅ Moderuoti netinkamą ar pažeidžiantį taisykles turinį

**Sistemos valdymas:**
- ✅ Peržiūrėti visų vartotojų informaciją
- ✅ Valdyti vartotojų vaidmenis (keitimas tarp guest/user/admin)
- ✅ Prižiūrėti visos platformos turinį
- ✅ Užtikrinti sistemos tvarkingumą ir kokybę

---

## 3. Pagrindiniai Sistemos Objektai

### 3.1. Serialas (Series)
- **Pavadinimas** (name) - teksto laukas
- **Nuotrauka** (image_url) - nuoroda į paveikslėlį (neprivaloma)
- **Sukūrimo data** (created_at)
- **Sukūrė vartotojas** (created_by) - nuoroda į vartotoją

### 3.2. Sezonas (Season)
- **Pavadinimas** (name) - teksto laukas
- **Priklausantis serialas** (fk_series) - nuoroda į serialą
- **Sukūrimo data** (created_at)
- **Sukūrė vartotojas** (created_by) - nuoroda į vartotoją

### 3.3. Epizodas (Episode)
- **Pavadinimas** (name) - teksto laukas
- **Nuotrauka** (image_url) - nuoroda į paveikslėlį (neprivaloma)
- **Priklausantis sezonas** (fk_season) - nuoroda į sezoną
- **Sukūrimo data** (created_at)
- **Sukūrė vartotojas** (created_by) - nuoroda į vartotoją

### 3.4. Komentaras (Comment)
- **Tekstas** (text) - komentaro turinys (neprivaloma)
- **Vertinimas** (rating) - 1-5 žvaigždutės
- **Priklausantis objektas** - serialas, sezonas arba epizodas (vienas iš trijų)
- **Sukūrimo data** (created_at)
- **Autorius** (fk_user) - nuoroda į vartotoją

### 3.5. Vartotojas (User)
- **ID** (id) - unikalus identifikatorius
- **Vaidmuo** (role) - "guest", "user" arba "admin"
- **Sukūrimo data** (created_at)

---

## 4. Autentifikacija ir Autorizacija

**Autentifikacija:**
- Vartotojai prisijungia naudojant el. paštą ir slaptažodį
- Autentifikacija valdoma per Supabase Auth sistemą
- JWT tokenai naudojami sesijų valdymui

**Autorizacija:**
- Vaidmenų pagrindu veikianti prieigos kontrolė (RBAC - Role-Based Access Control)
- Trys vaidmenų lygiai: guest, user, admin
- Row Level Security (RLS) politikos duomenų bazės lygmenyje
- API lygmens autorizacijos patikrinimai

---

## 5. API Funkcionalumas

Sistema suteikia RESTful API su šiais endpoint'ais:

**Serialai:**
- `GET /api/series` - Gauti visų serialų sąrašą
- `GET /api/series/[id]` - Gauti konkretaus serialo informaciją
- `POST /api/series` - Sukurti naują serialą (user, admin)
- `PUT /api/series/[id]` - Atnaujinti serialą (savininkas arba admin)
- `DELETE /api/series/[id]` - Ištrinti serialą (savininkas arba admin)
- `GET /api/series/[id]/seasons` - Gauti serialo sezonus

**Sezonai:**
- `GET /api/seasons` - Gauti visų sezonų sąrašą
- `GET /api/seasons/[id]` - Gauti konkretaus sezono informaciją
- `POST /api/seasons` - Sukurti naują sezoną (user, admin)
- `PUT /api/seasons/[id]` - Atnaujinti sezoną (savininkas arba admin)
- `DELETE /api/seasons/[id]` - Ištrinti sezoną (savininkas arba admin)
- `GET /api/seasons/[id]/episodes` - Gauti sezono epizodus

**Epizodai:**
- `GET /api/episodes` - Gauti visų epizodų sąrašą
- `GET /api/episodes/[id]` - Gauti konkretaus epizodo informaciją
- `POST /api/episodes` - Sukurti naują epizodą (user, admin)
- `PUT /api/episodes/[id]` - Atnaujinti epizodą (savininkas arba admin)
- `DELETE /api/episodes/[id]` - Ištrinti epizodą (savininkas arba admin)

**Komentarai:**
- `GET /api/comments` - Gauti visų komentarų sąrašą
- `GET /api/comments/[id]` - Gauti konkretų komentarą
- `POST /api/comments` - Sukurti naują komentarą (user, admin)
- `PUT /api/comments/[id]` - Atnaujinti komentarą (autorius arba admin)
- `DELETE /api/comments/[id]` - Ištrinti komentarą (autorius arba admin)

---

## 6. Techninė Informacija

**Frontend:**
- Next.js 15 (React 19)
- TypeScript
- CSS Modules
- Responsive dizainas (768px breakpoint)

**Backend:**
- Next.js API Routes
- Supabase (duomenų bazė ir autentifikacija)
- PostgreSQL

**UI/UX:**
- Responsive grid sistema
- Modal dialogs turinio pridėjimui
- Realaus laiko paieška
- Font Awesome ikonos
- Google Fonts (Poppins, Roboto)
- Violetinių/rožinių spalvų gradient dizainas
