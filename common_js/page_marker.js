function setActiveNavLink() {
    const navLinks = document.querySelectorAll('nav a, #nav-menu a');
    const currentUrl = window.location.href;
    navLinks.forEach(link => {
        const linkUrl = link.href;
        if (currentUrl === linkUrl) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
setActiveNavLink();