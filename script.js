const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

const canvasBlur = document.getElementById("hero-blurred");
const contextBlur = canvasBlur.getContext("2d");

const frameCount = 300;
const currentFrame = index => (
  `frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`
)

const preloadImages = () => {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
  }
};

const img = new Image();
img.src = currentFrame(0);

img.onload=function(){
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  
  canvasBlur.width = img.width;
  canvasBlur.height = img.height;
  contextBlur.drawImage(img, 0, 0);
}

const updateImage = index => {
  img.src = currentFrame(index);
  context.drawImage(img, 0, 0);
  contextBlur.drawImage(img, 0, 0);
}

// Background scroll logic
window.addEventListener('scroll', () => {  
  const scrollTop = html.scrollTop;
  const maxScrollTop = html.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );
  
  requestAnimationFrame(() => updateImage(frameIndex))
});

preloadImages();

// Initialize AOS (Animate On Scroll)
AOS.init({
    once: true,
    offset: 50,
    duration: 800,
    easing: 'ease-out-cubic',
});

// Fetch GitHub Projects
async function fetchGitHubProjects() {
    const container = document.getElementById('github-projects');
    
    let allRepos = [];

    // 1. Fetch repos from dyaksaadi
    try {
        const resUser = await fetch('https://api.github.com/users/dyaksaadi/repos?sort=updated&per_page=4');
        if (resUser.ok) {
            const userRepos = await resUser.json();
            allRepos = allRepos.concat(userRepos);
        }
    } catch (e) {
        console.error('Error fetching user repos', e);
    }

    // 2. Fetch specific external repos
    const extraRepos = [
        'hikam074/PBOBarberMate',
        'hikam074/basda_sisforklinikhewan'
    ];

    for (const repoName of extraRepos) {
        try {
            const resRepo = await fetch(`https://api.github.com/repos/${repoName}`);
            if (resRepo.ok) {
                const repoData = await resRepo.json();
                allRepos.push(repoData);
            }
        } catch (e) {
            console.error(`Error fetching ${repoName}`, e);
        }
    }

    // 3. Render all repos with new Tailwind/Glass design
    container.innerHTML = ''; // clear loading

    if (allRepos.length > 0) {
        allRepos.forEach((repo, index) => {
            const card = document.createElement('div');
            card.className = 'glass p-8 hover:-translate-y-3 hover:border-primary/50 transition-all duration-300 flex flex-col h-full group relative overflow-hidden';
            
            // Subtle hover glow effect
            card.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10 flex-grow">
                    <div class="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <i class="fab fa-github text-2xl text-gray-300 group-hover:text-primary transition-colors"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-3"><a href="${repo.html_url}" target="_blank" class="hover:text-primary transition-colors focus:outline-none before:absolute before:inset-0">${repo.name}</a></h3>
                    <p class="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">${repo.description ? repo.description : 'Belum ada deskripsi untuk proyek ini.'}</p>
                </div>
                <div class="relative z-10 mt-auto pt-6 border-t border-white/10 flex items-center justify-between text-sm text-gray-400 font-medium">
                    <div class="flex gap-3">
                        ${repo.language ? `<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span>${repo.language}</span>` : ''}
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1 hover:text-yellow-400 transition-colors"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span class="flex items-center gap-1 hover:text-blue-400 transition-colors"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                </div>
            `;
            // Add animation attributes
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());
            
            container.appendChild(card);
        });
    } else {
        container.innerHTML = '<p class="text-gray-400 col-span-full text-center text-lg">Belum ada repositori publik yang tersedia.</p>';
    }
}

// Call the function when page loads
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);

// Mobile Menu Logic
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

if(menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if(isMenuOpen) {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            menuBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}
