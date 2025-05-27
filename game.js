const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const baslamaEkrani = document.getElementById('startScreen');
const oyunBittiEkrani = document.getElementById('gameOverScreen');
const skorElementi = document.getElementById('score');
const seviyeElementi = document.getElementById('level');
const tecrübeElementi = document.getElementById('exp');
const oyunBilgiElementi = document.getElementById('gameInfo');
const zarKutusu = document.getElementById('diceContainer');
const sonSkorElementi = document.getElementById('finalScore');
const sonSeviyeElementi = document.getElementById('finalLevel');
const baslatButonu = document.getElementById('startButton');
const yenidenBaslatButonu = document.getElementById('restartButton');
const yenidenAtmaButonu = document.getElementById('rerollSkill');
const atmaButonu = document.getElementById('discardSkill');
const turuBitirButonu = document.getElementById('endTurnButton');
const zarYerlestirmeSesi = document.getElementById('placeDiceSound');
const seviyeAtlamaSesi = document.getElementById('levelUpSound');
const yenidenAtmaSesi = document.getElementById('rerollSound');
const atmaSesi = document.getElementById('discardSound');
const turBitirmeSesi = document.getElementById('endTurnSound');
const oyunBittiSesi = document.getElementById('gameOverSound');
const arkaPlanMuzigi = document.getElementById('backgroundMusic');

// Oyun Ayarları
const TAHTA_BOYUTU = 6;
const HUCRE_BOYUTU = 60;
const TAHTA_OFSET_X = 220;
const TAHTA_OFSET_Y = 30;
const ZAR_TIPLERI = ['fire', 'lake', 'forest', 'village', 'farm', 'mountain'];
const ZAR_RENKLERI = {
    'fire': '#ff695a',
    'lake': '#50b9eb',
    'forest': '#42bc7f',
    'village': '#dd7814',
    'farm': '#ffe091',
    'mountain': '#909edd'
};
const EL_BOYUTU = 5;

// Oyun Durumu
let oyunCalisiyor = false;
let skor = 0;
let seviye = 1;
let tecrübe = 0;  
let sonrakiSeviyeIcinTecrübe = 25;
let tur = 1;
let mana = 3;
let tahta = [];
let çekmeYigini = [];
let atikYigini = [];
let el = [];
let seciliZarIndeksi = -1;
let seciliSatir = -1;
let seciliSutun = -1;
let ormanMevcut = false;
let golMevcut = false;
let muzikAcik = true;

// Oyun tahtasını başlat
function tahtayiBaslat() {
    tahta = [];
    for (let i = 0; i < TAHTA_BOYUTU; i++) {
        let satir = [];
        for (let j = 0; j < TAHTA_BOYUTU; j++) {
            satir.push(null);
        }
        tahta.push(satir);
    }
}

// Zar destesini başlat
function desteyiBaslat() {
    çekmeYigini = [];
    for (let i = 0; i < 60; i++) {
        const tip = ZAR_TIPLERI[Math.floor(Math.random() * ZAR_TIPLERI.length)];
        const deger = Math.floor(Math.random() * 6) + 1;
        çekmeYigini.push({ type: tip, value: deger });
    }
    çekmeYigini.sort(() => Math.random() - 0.5); // karıştırıyoz işte
}

// İlk eli çek (5 zar)
function eliCek() {
    el = [];
    while (el.length < EL_BOYUTU && çekmeYigini.length > 0) {
        el.push(çekmeYigini.pop());
    }
    zarGoruntusunuGuncelle();
}

// sesi çalmak için fonksiyon
function sesCal(sesiÇal) {
    if (sesiÇal) {
        sesiÇal.currentTime = 0;
        sesiÇal.play().catch(e => console.log('Ses çalınamadı ya :(', e));
    }
}

// arka plan müziği için fonksiyon
function arkaplanMuzigiBaslat() {
    if (arkaPlanMuzigi) {
        arkaPlanMuzigi.volume = 0.3; // sesi az açıyoruz ki sinir olmasın kimse
        arkaPlanMuzigi.play().catch(e => console.log('Müzik açılmadı', e));
    }
}

function arkaplanMuzigiDurdur() {
    if (arkaPlanMuzigi) {
        arkaPlanMuzigi.pause();
        arkaPlanMuzigi.currentTime = 0;
    }
}

function zarGoruntusunuGuncelle() {
    zarKutusu.innerHTML = '';
    el.forEach((zar, indeks) => {
        const zarElementi = document.createElement('div');
        zarElementi.className = `dice-panel dice-${zar.type}`;
        zarElementi.setAttribute('data-index', indeks);
        zarElementi.style.width = '70px';
        zarElementi.style.height = '70px';
        zarElementi.style.marginRight = '10px';

        if (indeks === el.length - 1) {
            zarElementi.style.marginRight = '0';
        }

        const noktaKonteyneri = document.createElement('div');
        noktaKonteyneri.style.position = 'relative';
        noktaKonteyneri.style.width = '100%';
        noktaKonteyneri.style.height = '100%';
        noktaKonteyneri.style.display = 'flex';
        noktaKonteyneri.style.justifyContent = 'center';
        noktaKonteyneri.style.alignItems = 'center';

        const noktaYaricapi = 4;
        const noktaAraligi = 12;
        const noktaRengi = 'white';

        const noktaOlustur = (x, y) => {
            const nokta = document.createElement('div');
            nokta.style.position = 'absolute';
            nokta.style.width = `${noktaYaricapi * 2}px`;
            nokta.style.height = `${noktaYaricapi * 2}px`;
            nokta.style.backgroundColor = noktaRengi;
            nokta.style.borderRadius = '50%';
            nokta.style.left = `calc(50% + ${x}px)`;
            nokta.style.top = `calc(50% + ${y}px)`;
            nokta.style.transform = 'translate(-50%, -50%)';
            return nokta;
        };

        switch (zar.value) {
            case 1:
                noktaKonteyneri.appendChild(noktaOlustur(0, 0));
                break;
            case 2:
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, noktaAraligi));
                break;
            case 3:
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(0, 0));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, noktaAraligi));
                break;
            case 4:
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, noktaAraligi));
                break;
            case 5:
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(0, 0));
                break;
            case 6:
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, 0));
                noktaKonteyneri.appendChild(noktaOlustur(-noktaAraligi, noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, -noktaAraligi));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, 0));
                noktaKonteyneri.appendChild(noktaOlustur(noktaAraligi, noktaAraligi));
                break;
        }

        zarElementi.appendChild(noktaKonteyneri);

        if (seciliZarIndeksi === indeks) {
            zarElementi.style.border = '4px solid #ffaa66';
        } else {
            zarElementi.style.border = '2px solid white';
        }

        zarElementi.style.position = 'relative';
        zarElementi.style.display = 'flex';
        zarElementi.style.justifyContent = 'center';
        zarElementi.style.alignItems = 'center';

        zarElementi.addEventListener('click', () => {
            seciliZarIndeksi = indeks;
            zarGoruntusunuGuncelle();
        });

        zarKutusu.appendChild(zarElementi);
    });

    const kalanZar = çekmeYigini.length + el.length + atikYigini.length;
    oyunBilgiElementi.textContent = `Turn: ${tur}`;
}

// İstatistikleri güncelle
function istatistikleriGuncelle() {
    skorElementi.textContent = `${skor}`;
    seviyeElementi.textContent = `Lv. ${seviye}`;
    tecrübeElementi.textContent = `EXP: ${tecrübe}/${sonrakiSeviyeIcinTecrübe}`;
    manaDisplay.innerHTML = `<span>Mana<br>${mana}</span>`;
}

//burda zarların nereye koyulabileceğine bakıyoruz
function zarYerlestirilebilirMi(satir, sutun, zar) {
    if (!zar || satir < 0 || sutun < 0 || satir >= TAHTA_BOYUTU || sutun >= TAHTA_BOYUTU || tahta[satir][sutun] !== null) {
        return false;
    }
    
    switch (zar.type) {
        case 'lake':
            return komsuZarVarMi(satir, sutun);
        case 'forest':
            if (!ormanMevcut) return false;
            return cizgiUstundeKomsuZarVarMi(satir, sutun);
        case 'village':
            return !caprazlarDahilKomsuZarVarMi(satir, sutun);
        case 'farm':
            return golKomsusuMu(satir, sutun);
        case 'fire':
        case 'mountain':
            return true;
        default:
            return false;
    }
}

// komşu kontrol - sadece yatay ve dikey 
function komsuZarVarMi(satir, sutun) {
    const yonler = [
        [-1, 0], // yukarı
        [1, 0],  // aşağı
        [0, -1], // sol
        [0, 1]   // sağ
    ];
    
    for (const [ds, dt] of yonler) {
        const yeniSatir = satir + ds;
        const yeniSutun = sutun + dt;
        
        if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun] !== null) {
            return true;
        }
    }
    
    return false;
}

// komşu kontrol - çaprazlar dahil (köy için)
function caprazlarDahilKomsuZarVarMi(satir, sutun) {
    const yonler = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // yatay ve dikey
        [-1, -1], [-1, 1], [1, -1], [1, 1] // çapraz
    ];
    
    for (const [ds, dt] of yonler) {
        const yeniSatir = satir + ds;
        const yeniSutun = sutun + dt;
        
        if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun] !== null) {
            return true;
        }
    }
    
    return false;
}

// düz çizgi üzerinde komşu zar kontrolü (orman için)
function cizgiUstundeKomsuZarVarMi(satir, sutun) {
    const yonler = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    for (const [ds, dt] of yonler) {
        const yeniSatir = satir + ds;
        const yeniSutun = sutun + dt;
        
        if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun] !== null) {
            return true;
        }
    }
    
    return false;
}

// hücrenin göl komşusu olup olmadığını kontrol et (çiftlik için)
function golKomsusuMu(satir, sutun) {
    const yonler = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    for (const [ds, dt] of yonler) {
        const yeniSatir = satir + ds;
        const yeniSutun = sutun + dt;
        
        if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun] && tahta[yeniSatir][yeniSutun].type === 'lake') {
            return true;
        }
    }
    
    return false;
}

function zorlaZarYerlestir(satir, sutun) {
    if (seciliZarIndeksi < 0 || !zarYerlestirilebilirMi(satir, sutun, el[seciliZarIndeksi]) || mana < 1) {
        return false;
    }
    
    tahta[satir][sutun] = { ...el[seciliZarIndeksi] };
    mana -= 1;
    zarEtkisiniUygula(satir, sutun);
    atikYigini.push(el.splice(seciliZarIndeksi, 1)[0]);
    seciliZarIndeksi = -1;
    zarGoruntusunuGuncelle();
    istatistikleriGuncelle();
    tahtaDoluMu();
    sesCal(zarYerlestirmeSesi);
    return true;
}

function zarEtkisiniUygula(satir, sutun) {
    const zar = tahta[satir][sutun];
    let kazanilanPuan = zar.value;
    let kazanilanTecrübe = kazanilanPuan;
    
    switch (zar.type) {
        case 'fire':
            kazanilanPuan += atesEtkisiniUygula(satir, sutun, zar.value);
            kazanilanTecrübe = kazanilanPuan;
            break;
        case 'lake':
            const golHucreleri = golEtkisiniUygula(satir, sutun, zar.value);
            kazanilanPuan += golHucreleri;
            kazanilanTecrübe = kazanilanPuan;
            break;
        case 'forest':
            const ormanBonusu = ormanEtkisiniUygula(satir, sutun);
            kazanilanPuan += ormanBonusu;
            kazanilanTecrübe = kazanilanPuan;
            break;
        case 'village':
            mana += zar.value;
            // zar değeri kadar el'e zar ekle (EL_BOYUTU'na kadar)
            for (let i = 0; i < zar.value && el.length < EL_BOYUTU && çekmeYigini.length > 0; i++) {
                el.push(çekmeYigini.pop());
            }
            kazanilanTecrübe = kazanilanPuan;
            break;
        case 'farm':
            ciftlikEtkisiniUygula(satir, sutun);
            kazanilanTecrübe = kazanilanPuan;
            break;
        case 'mountain':
            kazanilanTecrübe = kazanilanPuan;
            break;
    }
    
    skor += kazanilanPuan;
    tecrübe += kazanilanTecrübe;
    
    if (tecrübe >= sonrakiSeviyeIcinTecrübe) {
        seviyeAtla();
    }
    
    zarGoruntusunuGuncelle();
    istatistikleriGuncelle();
}

// Ateş zarı etkisi: Bitişik zarların değerlerini azalt ve yok edilen zarlar için puan kazan
function atesEtkisiniUygula(satir, sutun, menzil) {
    let puanlar = 0;
    for (let mesafe = 1; mesafe <= menzil; mesafe++) {
        const etki = menzil - mesafe + 1;
        const yonler = [
            [-mesafe, 0], [mesafe, 0], [0, -mesafe], [0, mesafe]
        ];
        
        for (const [ds, dt] of yonler) {
            const yeniSatir = satir + ds;
            const yeniSutun = sutun + dt;
            
            if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun]) {
                tahta[yeniSatir][yeniSutun].value -= etki;
                
                if (tahta[yeniSatir][yeniSutun].value <= 0) {
                    puanlar += etki;
                    tahta[yeniSatir][yeniSutun] = null;
                }
            }
        }
    }
    
    return puanlar;
}

// Göl zarı etkisi: Bitişik boş hücreleri göl zarlarıyla doldur
function golEtkisiniUygula(satir, sutun, deger) {
    let toplamGolDegeri = 0;
    const yonler = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    for (const [ds, dt] of yonler) {
        const yeniSatir = satir + ds;
        const yeniSutun = sutun + dt;
        
        if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun] === null) {
            tahta[yeniSatir][yeniSutun] = { type: 'lake', value: deger };
            toplamGolDegeri += deger;
        }
    }
    
    return toplamGolDegeri;
}

// Orman zarı etkisi: Bitişik zarların değerlerine göre puan kazan
function ormanEtkisiniUygula(satir, sutun) {
    let puanlar = 0;
    const yonler = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    for (const [ds, dt] of yonler) {
        const yeniSatir = satir + ds;
        const yeniSutun = sutun + dt;
        
        if (yeniSatir >= 0 && yeniSatir < TAHTA_BOYUTU && yeniSutun >= 0 && yeniSutun < TAHTA_BOYUTU && tahta[yeniSatir][yeniSutun]) {
            puanlar += tahta[yeniSatir][yeniSutun].value;
        }
    }
    
    return puanlar;
}

// Çiftlik zarı etkisi: Her turda değerini artır (6'ya kadar)
function ciftlikEtkisiniUygula(satir, sutun) {
    if (tahta[satir][sutun].value < 6) {
        tahta[satir][sutun].value++;
        skor += 2;
    }
}

// Tahtanın dolu olup olmadığını kontrol et
function tahtaDoluMu() {
    for (let i = 0; i < TAHTA_BOYUTU; i++) {
        for (let j = 0; j < TAHTA_BOYUTU; j++) {
            if (tahta[i][j] === null) {
                return false;
            }
        }
    }
    
    oyunuBitir();
    return true;
}

// Seviye atlama fonksiyonu
function seviyeAtla() {
    seviye++;
    sesCal(seviyeAtlamaSesi);
    tecrübe -= sonrakiSeviyeIcinTecrübe; // Fazla tecrübeyi aktar
    sonrakiSeviyeIcinTecrübe = 25 * seviye;
    çekmeYigini = [...çekmeYigini, ...atikYigini]; //atık yığınındaki kartları tekrar destemize koyuyoruz
    atikYigini = [];
    çekmeYigini.sort(() => Math.random() - 0.5);
    ormanMevcut = true;
    golMevcut = true;
    eliCek();
    istatistikleriGuncelle();
}

// Fare hareketini işleme
function fareHareketiniIsle(e) {
    const rect = canvas.getBoundingClientRect();
    const fareX = e.clientX - rect.left;
    const fareY = e.clientY - rect.top;
    const sutun = Math.floor((fareX - TAHTA_OFSET_X) / HUCRE_BOYUTU);
    const satir = Math.floor((fareY - TAHTA_OFSET_Y) / HUCRE_BOYUTU);
    
    if (satir >= 0 && satir < TAHTA_BOYUTU && sutun >= 0 && sutun < TAHTA_BOYUTU) {
        seciliSatir = satir;
        seciliSutun = sutun;
    } else {
        seciliSatir = -1;
        seciliSutun = -1;
    }
    
    draw();
}

// Fare tıklamasını işleme
function tiklamaIsle(e) {
    const rect = canvas.getBoundingClientRect();
    const fareX = e.clientX - rect.left;
    const fareY = e.clientY - rect.top;
    const sutun = Math.floor((fareX - TAHTA_OFSET_X) / HUCRE_BOYUTU);
    const satir = Math.floor((fareY - TAHTA_OFSET_Y) / HUCRE_BOYUTU);
    
    if (satir >= 0 && satir < TAHTA_BOYUTU && sutun >= 0 && sutun < TAHTA_BOYUTU) {
        if (seciliZarIndeksi >= 0 && zarYerlestirilebilirMi(satir, sutun, el[seciliZarIndeksi]) && mana >= 1) {
            zorlaZarYerlestir(satir, sutun);
        }
    }
    
    draw();
}

// Tahtaya zar çizme
function tahtayaZarCiz(satir, sutun) {
    const zar = tahta[satir][sutun];
    const x = TAHTA_OFSET_X + sutun * HUCRE_BOYUTU;
    const y = TAHTA_OFSET_Y + satir * HUCRE_BOYUTU;
    
    ctx.fillStyle = ZAR_RENKLERI[zar.type];
    ctx.fillRect(x + 5, y + 5, HUCRE_BOYUTU - 10, HUCRE_BOYUTU - 10);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 5, HUCRE_BOYUTU - 10, HUCRE_BOYUTU - 10);
    
    const noktaYaricapi = 5;
    const noktaAraligi = 14;
    const merkezX = x + HUCRE_BOYUTU / 2;
    const merkezY = y + HUCRE_BOYUTU / 2;
    
    ctx.fillStyle = 'white';
    
    switch (zar.value) {
        case 1:
            ctx.beginPath();
            ctx.arc(merkezX, merkezY, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 2:
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 3:
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX, merkezY, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 4:
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 5:
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX, merkezY, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 6:
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY - noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX - noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(merkezX + noktaAraligi, merkezY + noktaAraligi, noktaYaricapi, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

function oyunBaslat() {
    arkaplanMuzigiBaslat();
    skor = 0;
    seviye = 1;
    tecrübe = 0;
    sonrakiSeviyeIcinTecrübe = 25;
    tur = 1;
    mana = 3;
    ormanMevcut = true;
    golMevcut = true;
    
    tahtayiBaslat();
    desteyiBaslat();
    el = [];
    eliCek();
    istatistikleriGuncelle();
    
    document.getElementById('gameStats').style.display = 'block';
    baslamaEkrani.style.display = 'none';
    oyunBittiEkrani.style.display = 'none';
    
    canvas.addEventListener('mousemove', fareHareketiniIsle);
    canvas.addEventListener('click', tiklamaIsle);
    
    oyunCalisiyor = true;
    draw();
}

function oyunuBitir() {
    sesCal(oyunBittiSesi);
    arkaplanMuzigiDurdur();
    
    oyunCalisiyor = false;
    canvas.removeEventListener('mousemove', fareHareketiniIsle);
    canvas.removeEventListener('click', tiklamaIsle);
    
    document.getElementById('gameStats').style.display = 'none';
    sonSkorElementi.textContent = `Your Score: ${skor}`;
    sonSeviyeElementi.textContent = `Level Reached: ${seviye}`;
    oyunBittiEkrani.style.display = 'flex';
}

// Turu bitir
function turuBitir() {
    sesCal(turBitirmeSesi);
    tur++;
    mana = 3;
    
    // Çiftlik etkilerini uygula
    for (let i = 0; i < TAHTA_BOYUTU; i++) {
        for (let j = 0; j < TAHTA_BOYUTU; j++) {
            if (tahta[i][j] && tahta[i][j].type === 'farm') {
                ciftlikEtkisiniUygula(i, j);
            }
        }
    }
    
    // Eli EL_BOYUTU'na kadar doldur
    while (el.length < EL_BOYUTU && çekmeYigini.length > 0) {
        el.push(çekmeYigini.pop());
    }
    
    zarGoruntusunuGuncelle();
    istatistikleriGuncelle();
    draw();
    
    // Oyunun bitip bitmediğini kontrol et
    if (çekmeYigini.length === 0 && el.length === 0) {
        oyunuBitir();
    }
}

// Seçili zarı yeniden at
function zariYenidenAt() {
    sesCal(yenidenAtmaSesi);
    if (seciliZarIndeksi >= 0 && mana >= 1) {
        el[seciliZarIndeksi].value = Math.floor(Math.random() * 6) + 1;
        mana -= 1;
        zarGoruntusunuGuncelle();
        istatistikleriGuncelle();
    }
}

// Seçili zarı at
function zariAt() {
    sesCal(atmaSesi);
    if (seciliZarIndeksi >= 0 && mana >= 1) {
        atikYigini.push(el.splice(seciliZarIndeksi, 1)[0]);
        seciliZarIndeksi = -1;
        mana -= 1;
        
        // Atılan zarın yerine yeni zar çek
        if (çekmeYigini.length > 0 && el.length < EL_BOYUTU) {
            el.push(çekmeYigini.pop());
        }
        
        zarGoruntusunuGuncelle();
        istatistikleriGuncelle();
    }
}

function zarRenginiAl(tip) {
    switch (tip) {
        case 'fire': return '#ff695a';
        case 'lake': return '#50b9eb';
        case 'forest': return '#42bc7f';
        case 'village': return '#dd7814';
        case 'farm': return '#ffe091';
        case 'mountain': return '#909edd';
        default: return 'white';
    }
}

function zarBilgisiniCiz(ctx, zar, canvas) {
    let baslik = '';
    let aciklama = '';
    
    switch (zar.type) {
        case 'fire':
            baslik = "fire";
            aciklama = "Her yere koyulabilir. Düz çizgi üzerindeki zarları hasar verir.";
            break;
        case 'lake':
            baslik = "lake";
            aciklama = "Diğer zarların yanına (yukarı, aşağı, sol, sağ) konulmalıdır. Boş alanlara yayılır.";
            break;
        case 'forest':
            baslik = "forest";
            aciklama = "Diğer zarların yanına konulmalıdır. Komşularından puan kazanır.";
            break;
        case 'village':
            baslik = "village";
            aciklama = "Yanında zar olmayan yerlere konulmalıdır (çaprazlar dahil). Mana ve zarın değeri kadar zar verir.";
            break;
        case 'farm':
            baslik = "farm";
            aciklama = "Göl zarının yanına konulmalıdır. Her tur büyür.";
            break;
        case 'mountain':
            baslik = "mountain";
            aciklama = "Her yere konulabilir.";
            break;
    }
    
    const merkezX = canvas.width / 2;
    const tabanY = canvas.height - 170;
    
    ctx.fillStyle = zarRenginiAl(zar.type);
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(baslik, merkezX, tabanY);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(aciklama, merkezX, tabanY + 25);
    
    ctx.textAlign = 'start';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < TAHTA_BOYUTU; i++) {
        for (let j = 0; j < TAHTA_BOYUTU; j++) {
            const x = TAHTA_OFSET_X + j * HUCRE_BOYUTU;
            const y = TAHTA_OFSET_Y + i * HUCRE_BOYUTU;
            const merkezX = x + HUCRE_BOYUTU / 2;
            const merkezY = y + HUCRE_BOYUTU / 2;
            const eşkenarDörtgenBoyutu = HUCRE_BOYUTU * 0.4;
            
            let gecerliHucreMi = false;
            if (seciliZarIndeksi >= 0 && el[seciliZarIndeksi]) {
                gecerliHucreMi = zarYerlestirilebilirMi(i, j, el[seciliZarIndeksi]);
            }
            
            ctx.beginPath();
            ctx.moveTo(merkezX, merkezY - eşkenarDörtgenBoyutu);
            ctx.lineTo(merkezX + eşkenarDörtgenBoyutu, merkezY);
            ctx.lineTo(merkezX, merkezY + eşkenarDörtgenBoyutu);
            ctx.lineTo(merkezX - eşkenarDörtgenBoyutu, merkezY);
            ctx.closePath();
            
            ctx.fillStyle = '#2a2a55';
            ctx.fill();
            
            if (gecerliHucreMi) {
                ctx.strokeStyle = '#00b7eb';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'transparent';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            if (tahta[i][j]) {
                tahtayaZarCiz(i, j);
            }
        }
    }
    
    // Seçili zar bilgilerini göster
    if (seciliZarIndeksi >= 0 && el[seciliZarIndeksi]) {
        zarBilgisiniCiz(ctx, el[seciliZarIndeksi], canvas);
    }
}

// Olay dinleyicileri
baslatButonu.addEventListener('click', oyunBaslat);
yenidenBaslatButonu.addEventListener('click', oyunBaslat);
turuBitirButonu.addEventListener('click', turuBitir);
yenidenAtmaButonu.addEventListener('click', zariYenidenAt);
atmaButonu.addEventListener('click', zariAt);

// Başlangıç
draw();