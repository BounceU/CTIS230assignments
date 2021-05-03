document.querySelectorAll(".blogImage").forEach(item => {

    item.addEventListener('click', function(e) {
        console.log('hello');
        if (item.style.width == '200px') {
            item.style.width = '400px';
            item.style.height = '400px';
        } else {
            item.style.width = '200px';
            item.style.height = '200px';
        }
    }, false);

});;