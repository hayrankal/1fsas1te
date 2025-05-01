// Kayıtlı fotoğraf yolları
let photoPaths = [];

document.addEventListener('DOMContentLoaded', function() {
    const photoGallery = document.getElementById('photo-gallery');
    const photoPathInput = document.getElementById('photo-path');
    const addPhotoBtn = document.getElementById('add-photo');
    const addFolderBtn = document.getElementById('add-folder');
    const saveGalleryBtn = document.getElementById('save-gallery');
    const clearGalleryBtn = document.getElementById('clear-gallery');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const folderInput = document.getElementById('folder-input');
    
    // Galeriyi yükle
    loadGallery();
    
    // Tek fotoğraf ekleme
    addPhotoBtn.addEventListener('click', function() {
        const path = photoPathInput.value.trim();
        if (path) {
            addPhoto(path, true);
            photoPathInput.value = '';
            errorMessage.textContent = '';
            showSuccess('Fotoğraf başarıyla eklendi!');
        } else {
            errorMessage.textContent = 'Lütfen geçerli bir dosya yolu girin.';
        }
    });
    
    // Enter tuşu ile ekleme
    photoPathInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addPhotoBtn.click();
        }
    });
    
    // Klasörden ekleme
    addFolderBtn.addEventListener('click', function() {
        folderInput.value = ''; // Aynı klasörü tekrar seçebilmek için
        folderInput.click();
    });
    
    folderInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            let addedCount = 0;
            for (let file of files) {
                // Sadece resim dosyalarını ekle
                if (file.type.match('image.*')) {
                    const path = file.webkitRelativePath ? file.webkitRelativePath.replace(/^[^\/]+\//, '') : file.name;
                    addPhoto(path, true);
                    addedCount++;
                }
            }
            showSuccess(`${addedCount} fotoğraf başarıyla eklendi!`);
        }
    });
    
    // Galeriyi kaydet butonu
    saveGalleryBtn.addEventListener('click', saveGalleryToFile);
    
    // Galeriyi temizle butonu
    clearGalleryBtn.addEventListener('click', function() {
        if (confirm('Galeriyi tamamen temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            photoGallery.innerHTML = '';
            photoPaths = [];
            localStorage.removeItem('photoGallery');
            showSuccess('Galeri temizlendi!');
        }
    });
    
    // Fotoğraf ekleme fonksiyonu
    function addPhoto(path, saveToArray = true) {
        // Aynı fotoğrafın tekrar eklenmesini önle
        if (photoPaths.includes(path)) {
            errorMessage.textContent = 'Bu fotoğraf zaten galeride mevcut!';
            return;
        }
        
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
            if (saveToArray && !photoPaths.includes(path)) {
                photoPaths.push(path);
                saveGallery();
            }
            addDeleteListener(photoCard, path);
        };
        
        photoGallery.appendChild(photoCard);
    }
    
    function addDeleteListener(card, path) {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
                    const index = photoPaths.indexOf(path);
                    if (index > -1) {
                        photoPaths.splice(index, 1);
                        saveGallery();
                    }
                    card.remove();
                    showSuccess('Fotoğraf silindi!');
                }
            });
        }
    }
    
    // Galeriyi localStorage'a kaydet
    function saveGallery() {
        localStorage.setItem('photoGallery', JSON.stringify(photoPaths));
    }
    
    // Galeriyi localStorage'dan yükle
    function loadGallery() {
        const savedPhotos = localStorage.getItem('photoGallery');
        if (savedPhotos) {
            photoPaths = JSON.parse(savedPhotos);
            photoPaths.forEach(path => {
                addPhoto(path, false); // Zaten dizide olduğu için false
            });
        }
    }
    
    // Başarı mesajı göster
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.classList.remove('hidden');
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
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
            '        <div class="gallery" id="photo-gallery">',
            galleryHTML,
            '        </div>',
            '    </div>',
            '    <script>',
            '        // Kayıtlı fotoğraf yolları',
            '        const photoPaths = ' + JSON.stringify(photoPaths) + ';',
            '',
            '        document.addEventListener("DOMContentLoaded", function() {',
            '            const gallery = document.getElementById("photo-gallery");',
            '            ',
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
        a.download = 'gallery_export.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Galeri başarıyla kaydedildi! HTML dosyası indirildi.');
    }
});