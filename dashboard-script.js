// Dashboard Controller
class DashboardController {
    constructor() {
        this.currentProject = null;
        this.init();
    }
    
    init() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.attachEventListeners();
        this.initCardGlowEffect();
        this.addParticleEffect();
    }
    
    updateDateTime() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');
        
        if(dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        
        if(timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    attachEventListeners() {
        // Launch buttons
        document.querySelectorAll('.launch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const project = btn.dataset.project;
                this.showProjectModal(project);
            });
        });
        
        // Project cards click
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if(!e.target.closest('.launch-btn')) {
                    const project = card.dataset.project;
                    this.showProjectModal(project);
                }
            });
        });
        
        // Modal close
        const modal = document.getElementById('projectModal');
        const closeBtn = document.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
        
        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                modal.classList.remove('show');
            }
        });
        
        // Open in new tab
        document.getElementById('openNewTab').addEventListener('click', () => {
            if(this.currentProject) {
                this.openProject(this.currentProject, '_blank');
                document.getElementById('projectModal').classList.remove('show');
            }
        });
        
        // Open in same tab
        document.getElementById('openSameTab').addEventListener('click', () => {
            if(this.currentProject) {
                this.openProject(this.currentProject, '_self');
                document.getElementById('projectModal').classList.remove('show');
            }
        });
        
        // Open all projects button
        const openAllBtn = document.getElementById('openAllBtn');
        if(openAllBtn) {
            openAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAllProjects();
            });
        }
    }
    
    showProjectModal(project) {
        this.currentProject = project;
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        
        const projectNames = {
            portfolio: 'Personal Portfolio',
            todo: 'Smart Todo App',
            product: 'Product Store'
        };
        
        modalTitle.textContent = `Launch ${projectNames[project]}`;
        modal.classList.add('show');
    }
    
    openProject(project, target) {
        const paths = {
            portfolio: 'portfolio/index.html',
            todo: 'todo-app/index.html',
            product: 'product-page/index.html'
        };
        
        const path = paths[project];
        
        if(target === '_blank') {
            window.open(path, '_blank');
        } else {
            window.location.href = path;
        }
    }
    
    openAllProjects() {
        window.open('portfolio/index.html', '_blank');
        setTimeout(() => {
            window.open('todo-app/index.html', '_blank');
        }, 100);
        setTimeout(() => {
            window.open('product-page/index.html', '_blank');
        }, 200);
        
        this.showToast('Opening all projects in new tabs...');
    }
    
    initCardGlowEffect() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--x', `${x}%`);
                card.style.setProperty('--y', `${y}%`);
            });
        });
    }
    
    addParticleEffect() {
        const particlesContainer = document.querySelector('.particles');
        if(!particlesContainer) return;
        
        for(let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = `${Math.random() * 3}px`;
            particle.style.height = particle.style.width;
            particle.style.backgroundColor = 'rgba(255,255,255,0.3)';
            particle.style.borderRadius = '50%';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `float ${5 + Math.random() * 10}s linear infinite`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particlesContainer.appendChild(particle);
        }
    }
    
    showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.dashboard-toast');
        if(!toast) {
            toast = document.createElement('div');
            toast.className = 'dashboard-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #10b981;
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                z-index: 3000;
                transition: transform 0.3s;
                font-size: 14px;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
        }, 3000);
    }
}

// Initialize dashboard
const dashboard = new DashboardController();

// Add CSS animation for floating particles
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);