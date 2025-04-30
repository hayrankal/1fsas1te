// Kayıtlı fotoğraf yolları
let photoPaths = [];

document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('add-photo');
    const saveButton = document.getElementById('save-gallery');
    const pathInput = document.getElementById('photo-path');
    const gallery = document.getElementById('photo-gallery');
    const errorMessage = document.getElementById('error-message');
    
    // Fotoğraf ekleme fonksiyonu
    function addPhoto(path, saveToArray = true) {
        errorMessage.textContent = '';
        
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        
        const img = document.createElement('img');
        img.src = path;
        img.alt = "Galeri fotoğrafı";
        
        img.onerror = function() {
            photoCard.innerHTML = [
                '<div class="photo-info">',
                '  <strong>Fotoğraf yüklenemedi</strong>',
                '  <div class="photo-path">' + path + '</div>',
                '  <button class="delete-btn" data-path="' + path + '">×</button>',
                '</div>'
            ].join('');
            errorMessage.textContent = 'Fotoğraf bulunamadı: ' + path;
            addDeleteListener(photoCard, path);
        };
        
        img.onload = function() {
            photoCard.innerHTML = [
                '<img src="' + path + '" alt="Galeri fotoğrafı">',
                '<div class="photo-info">',
                '  <div class="photo-path">' + path + '</div>',
                '  <button class="delete-btn" data-path="' + path + '">×</button>',
                '</div>'
            ].join('');
            if (saveToArray) {
                photoPaths.push(path);
            }
            addDeleteListener(photoCard, path);
        };
        
        gallery.appendChild(photoCard);
        pathInput.value = '';
    }
    
    function addDeleteListener(card, path) {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = photoPaths.indexOf(path);
                if (index > -1) {
                    photoPaths.splice(index, 1);
                }
                card.remove();
                if (gallery.children.length === 0) {
                    showEmptyMessage();
                }
            });
        }
    }
    
    function showEmptyMessage() {
        gallery.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#666;">Henüz fotoğraf eklenmedi</p>';
    }
    
    function saveGalleryToFile() {
        const htmlContent = createHTMLContent();
        downloadFile(htmlContent);
    }
    
    function createHTMLContent() {
        const galleryHTML = generateGalleryHTML();
        
        return [
            '<!DOCTYPE html>',
            '<html lang="tr">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '    <title>Kalıcı Fotoğraf Galerisi</title>',
            '    <link rel="stylesheet" href="style.css">',
            '</head>',
            '<body>',
            '    <div class="container">',
            '        <h1>Kalıcı Fotoğraf Galerisi</h1>',
            '        <div class="input-area">',
            '            <h2>Fotoğraf Ekle</h2>',
            '            <input type="text" id="photo-path" placeholder="Fotoğraf dosya yolu (örn: images/foto.jpg veya ./foto.jpg)">',
            '            <div id="error-message" class="error"></div>',
            '            <button id="add-photo">Fotoğraf Ekle</button>',
            '            <button id="save-gallery" class="delete">Galeriyi Kaydet</button>',
            '        </div>',
            '        <div class="gallery" id="photo-gallery">',
            galleryHTML,
            '        </div>',
            '    </div>',
            '    <script>',
            '        const photoPaths = ' + JSON.stringify(photoPaths) + ';',
            '        document.addEventListener("DOMContentLoaded", function() {',
            '            const gallery = document.getElementById("photo-gallery");',
            '            photoPaths.forEach(path => {',
            '                const photoCard = document.createElement("div");',
            '                photoCard.className = "photo-card";',
            '                photoCard.innerHTML = \'<img src="\' + path + \'" alt="Galeri fotoğrafı"><div class="photo-info"><div class="photo-path">\' + path + \'</div><button class="delete-btn" onclick="this.parentNode.parentNode.remove()">×</button></div>\';',
            '                gallery.appendChild(photoCard);',
            '            });',
            '        });',
            '    </script>',
            '</body>',
            '</html>'
        ].join('\n');
    }
    
    function generateGalleryHTML() {
        if (photoPaths.length === 0) {
            return '            <p style="grid-column:1/-1; text-align:center; color:#666;">Henüz fotoğraf eklenmedi</p>';
        }
        
        return photoPaths.map(path => {
            return [
                '            <div class="photo-card">',
                '                <img src="' + path + '" alt="Galeri fotoğrafı">',
                '                <div class="photo-info">',
                '                    <div class="photo-path">' + path + '</div>',
                '                    <button class="delete-btn">×</button>',
                '                </div>',
                '            </div>'
            ].join('\n');
        }).join('\n');
    }
    
    function downloadFile(content) {
        const blob = new Blob([content], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Galeri kaydedildi! Lütfen indirilen dosyayı orijinal index.html dosyasının üzerine yazın.');
    }
    
    addButton.addEventListener('click', function() {
        const path = pathInput.value.trim();
        if (path) {
            addPhoto(path);
        } else {
            errorMessage.textContent = 'Lütfen bir dosya yolu girin';
        }
    });
    
    pathInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addButton.click();
        }
    });
    
    saveButton.addEventListener('click', saveGalleryToFile);
});