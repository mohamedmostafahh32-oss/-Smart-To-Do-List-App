// Smart To-Do List Application
// =============================

class TodoApp {
  constructor() {
    this.tasks = [];
    this.filter = 'all';
    this.settings = {
      reminders: true,
      darkMode: false,
      language: 'ar'
    };
    
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.render();
    this.bindEvents();
    this.updateStats();
  }

  loadFromStorage() {
    const storedTasks = localStorage.getItem('smartTodoTasks');
    const storedSettings = localStorage.getItem('smartTodoSettings');
    
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
    
    if (storedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
    }
  }

  saveToStorage() {
    localStorage.setItem('smartTodoTasks', JSON.stringify(this.tasks));
    localStorage.setItem('smartTodoSettings', JSON.stringify(this.settings));
  }

  bindEvents() {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => this.addTask(e));
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.filterTasks(e));
    });

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const saveSettingsBtn = document.getElementById('saveSettings');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openModal(settingsModal));
    }
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => this.closeModal(settingsModal));
    }
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => this.saveModalSettings(settingsModal));
    }
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
          this.closeModal(settingsModal);
        }
      });
    }

    // Bind checkbox events after initial render
    this.bindCheckboxEvents();
  }

  bindCheckboxEvents() {
    const checkboxes = document.querySelectorAll('.task-card__checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.closest('.task-card').dataset.id);
        this.toggleTask(id);
      });
    });
  }

  addTask(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('taskTitle');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    if (!titleInput.value.trim()) return;

    const task = {
      id: Date.now(),
      title: titleInput.value.trim(),
      priority: prioritySelect.value || 'medium',
      dueDate: dueDateInput.value || null,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.push(task);
    this.saveToStorage();
    this.render();
    this.updateStats();

    titleInput.value = '';
    prioritySelect.value = '';
    dueDateInput.value = '';
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
      this.render();
      this.updateStats();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveToStorage();
    this.render();
    this.updateStats();
  }

  filterTasks(e) {
    const filter = e.target.dataset.filter;
    this.filter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    this.render();
  }

  openModal(modal) {
    modal.classList.add('active');
    this.loadSettingsToModal();
  }

  closeModal(modal) {
    modal.classList.remove('active');
  }

  loadSettingsToModal() {
    document.getElementById('reminderToggle').checked = this.settings.reminders;
    document.getElementById('darkModeToggle').checked = this.settings.darkMode;
    document.getElementById('languageSelect').value = this.settings.language;
  }

  saveModalSettings(modal) {
    this.settings = {
      reminders: document.getElementById('reminderToggle').checked,
      darkMode: document.getElementById('darkModeToggle').checked,
      language: document.getElementById('languageSelect').value
    };
    this.saveToStorage();
    this.closeModal(modal);
  }

  updateStats() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    const activeCount = this.tasks.filter(t => !t.completed).length;
    const today = new Date().toDateString();
    const todayCount = this.tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).toDateString() === today;
    }).length;

    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('todayCount').textContent = todayCount;
  }

  render() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    let filteredTasks = [];
    switch (this.filter) {
      case 'active':
        filteredTasks = this.tasks.filter(t => !t.completed);
        break;
      case 'completed':
        filteredTasks = this.tasks.filter(t => t.completed);
        break;
      default:
        filteredTasks = this.tasks;
    }

    if (filteredTasks.length === 0) {
      tasksList.innerHTML = '';
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
      tasksList.innerHTML = filteredTasks.map(task => this.renderTaskCard(task)).join('');
      
      this.bindCheckboxEvents();
      
      document.querySelectorAll('.task-card__delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.closest('.task-card').dataset.id);
          this.deleteTask(id);
        });
      });
    }
  }

  renderTaskCard(task) {
    const completedClass = task.completed ? 'task-card--completed' : '';
    const priorityText = {
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة'
    };

    const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : 'بدون تاريخ';

    return `
      <div class="task-card ${completedClass}" data-id="${task.id}">
        <input type="checkbox" class="task-card__checkbox" ${task.completed ? 'checked' : ''} />
        <div class="task-card__content">
          <h3 class="task-card__title">${task.title}</h3>
          <div class="task-card__meta">
            <span class="task-card__priority task-card__priority--${task.priority}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              ${priorityText[task.priority]}
            </span>
            <span>|</span>
            <span>${formattedDate}</span>
          </div>
        </div>
        <button class="task-card__delete" aria-label="حذف المهمة">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 15 10 15 14 15 18 15 18 9 14 9 10 9 6 9"></polyline>
            <line x1="19" y1="5" x2="5" y2="5"></line>
          </svg>
        </button>
      </div>
    `;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});