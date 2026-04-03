// Task Management System with Local Storage
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('smartTasks')) || [];
        this.currentCategory = 'all';
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentSort = 'date';
        this.editingTaskId = null;
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
        this.updateStats();
        this.updateProgress();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('smartTasks', JSON.stringify(this.tasks));
        this.updateStats();
        this.updateProgress();
    }
    
    addTask(taskData) {
        const newTask = {
            id: Date.now(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.unshift(newTask);
        this.saveToLocalStorage();
        this.render();
        this.showToast('Task added successfully!');
    }
    
    updateTask(id, updatedData) {
        const index = this.tasks.findIndex(t => t.id === id);
        if(index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updatedData };
            this.saveToLocalStorage();
            this.render();
            this.showToast('Task updated!');
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.showToast('Task deleted');
    }
    
    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if(task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.render();
            this.showToast(task.completed ? 'Task completed! 🎉' : 'Task reopened');
        }
    }
    
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // Category filter
        if(this.currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentCategory);
        }
        
        // Priority filter
        if(this.currentFilter !== 'all') {
            filtered = filtered.filter(t => t.priority === this.currentFilter);
        }
        
        // Search filter
        if(this.searchQuery) {
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }
        
        // Sort
        if(this.currentSort === 'date') {
            filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if(this.currentSort === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if(this.currentSort === 'created') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return filtered;
    }
    
    render() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.getFilteredTasks();
        
        if(filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found. Create a new task to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredTasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''} priority-${task.priority}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-category">${this.getCategoryIcon(task.category)} ${task.category}</span>
                        ${task.dueDate ? `<span class="task-due-date"><i class="far fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span class="task-priority">${this.getPriorityIcon(task.priority)} ${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        // Attach event listeners to dynamic elements
        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.toggleComplete(parseInt(e.target.dataset.id));
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTask(parseInt(btn.dataset.id));
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('Delete this task?')) {
                    this.deleteTask(parseInt(btn.dataset.id));
                }
            });
        });
    }
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if(task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDesc').value = task.description || '';
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority;
            this.editingTaskId = id;
            document.getElementById('taskInputContainer').classList.add('show');
            document.getElementById('saveTask').textContent = 'Update Task';
        }
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('completionRate').textContent = `${rate}%`;
    }
    
    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const rate = total === 0 ? 0 : (completed / total) * 100;
        
        document.getElementById('progressBar').style.width = `${rate}%`;
        
        const progressText = document.getElementById('progressText');
        if(rate === 100) {
            progressText.innerHTML = '🎉 Perfect! All tasks completed!';
        } else if(rate >= 75) {
            progressText.innerHTML = '🌟 Almost there! Keep going!';
        } else if(rate >= 50) {
            progressText.innerHTML = '👍 Good progress!';
        } else if(rate > 0) {
            progressText.innerHTML = '💪 You\'ve made a start!';
        } else {
            progressText.innerHTML = '📝 Add your first task to begin!';
        }
    }
    
    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '👤',
            shopping: '🛒',
            health: '❤️'
        };
        return icons[category] || '📋';
    }
    
    getPriorityIcon(priority) {
        const icons = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        return icons[priority] || '⚪';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
    
    attachEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.editingTaskId = null;
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDesc').value = '';
            document.getElementById('taskDueDate').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('saveTask').textContent = 'Save Task';
            document.getElementById('taskInputContainer').classList.toggle('show');
        });
        
        // Cancel button
        document.getElementById('cancelTask').addEventListener('click', () => {
            document.getElementById('taskInputContainer').classList.remove('show');
            this.editingTaskId = null;
        });
        
        // Save task
        document.getElementById('saveTask').addEventListener('click', () => {
            const title = document.getElementById('taskTitle').value.trim();
            if(!title) {
                this.showToast('Please enter a task title');
                return;
            }
            
            const taskData = {
                title: title,
                description: document.getElementById('taskDesc').value,
                category: document.getElementById('taskCategory').value,
                dueDate: document.getElementById('taskDueDate').value,
                priority: document.getElementById('taskPriority').value
            };
            
            if(this.editingTaskId) {
                this.updateTask(this.editingTaskId, taskData);
            } else {
                this.addTask(taskData);
            }
            
            document.getElementById('taskInputContainer').classList.remove('show');
            this.editingTaskId = null;
        });
        
        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                document.getElementById('categoryTitle').textContent = 
                    btn.dataset.cat === 'all' ? 'All Tasks' : `${btn.dataset.cat} Tasks`;
                this.render();
            });
        });
        
        // Priority filter
        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });
        
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.render();
        });
        
        // Sort
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });
    }
}

// Initialize the app
const taskManager = new TaskManager();