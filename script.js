// Carregar tarefas do localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Filtro padrão: Mostrar todas as tarefas
let currentFilter = 'all';

function addTask() {
    const taskInput = document.getElementById("taskInput");

    if (taskInput.value.trim() !== "") {
        const taskText = taskInput.value;

        // Verificar se é uma edição ou adição
        const editTaskId = taskInput.getAttribute("data-edit-id");
        if (editTaskId) {
            // Editar tarefa existente
            const index = tasks.findIndex(task => task.id === parseInt(editTaskId));
            if (index !== -1) {
                tasks[index].text = taskText;
            }
            taskInput.removeAttribute("data-edit-id");
        } else {
            // Adicionar nova tarefa
            const taskId = new Date().getTime();
            tasks.push({ id: taskId, text: taskText, completed: false });
        }

        // Atualizar a lista de tarefas no HTML de acordo com o filtro atual
        filterTasks(currentFilter);

        // Limpar o campo de entrada
        taskInput.value = "";

        // Armazenar no localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

function removeTask(taskId) {
    // Remover a tarefa apenas se não estiver concluída
    const index = tasks.findIndex(task => task.id === taskId && !task.completed);
    if (index !== -1) {
        tasks.splice(index, 1);
        filterTasks(currentFilter);
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

function completeTask(taskId) {
    // Marcar a tarefa como concluída apenas se não estiver concluída
    const index = tasks.findIndex(task => task.id === taskId && !task.completed);
    if (index !== -1) {
        tasks[index].completed = true;
        filterTasks(currentFilter);
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

function deleteCompletedTasks() {
    // Exibir o modal de confirmação
    $('#confirmationModal').modal('show');

    // Configurar o botão de confirmação no modal
    document.getElementById('confirmDeletionBtn').onclick = function () {
        // Remover as tarefas concluídas apenas se o usuário confirmar
        tasks = tasks.filter(task => !task.completed);
        filterTasks(currentFilter);
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // Fechar o modal de confirmação
        $('#confirmationModal').modal('hide');
    };
}

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task && !task.completed) {
        const taskInput = document.getElementById("taskInput");
        taskInput.value = task.text;
        taskInput.setAttribute("data-edit-id", taskId);
    }
}

function filterTasks(filter) {
    currentFilter = filter;
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        if (
            (filter === 'all') ||
            (filter === 'toDo' && !task.completed) ||
            (filter === 'completed' && task.completed)
        ) {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            if (task.completed) {
                li.classList.add("list-group-item-success");
            }
            li.innerHTML = `
                <span>${task.text}</span>
                <div>
                    ${!task.completed ? `<button onclick="editTask(${task.id})" class="btn btn-warning btn-sm mr-2">Editar</button>` : ''}
                    <button onclick="removeTask(${task.id})" class="btn btn-danger btn-sm ${task.completed ? 'd-none' : ''}">Remover</button>
                    <button onclick="completeTask(${task.id})" class="btn btn-success btn-sm ${task.completed ? 'd-none' : ''}">Concluir</button>
                </div>
            `;
            taskList.appendChild(li);
        }
    });

    // Adicionar botão de exclusão de tarefas concluídas se estiver no filtro de tarefas concluídas
    if (filter === 'completed' && tasks.some(task => task.completed)) {
        const deleteCompletedButton = document.createElement("button");
        deleteCompletedButton.className = "btn btn-danger mt-3";
        deleteCompletedButton.innerText = "Excluir Tarefas Concluídas";
        deleteCompletedButton.onclick = deleteCompletedTasks;
        taskList.appendChild(deleteCompletedButton);
    }
}

// ... (Seu código existente)

// Função para inicializar a ordenação das tarefas
function initializeSortable() {
    $("#taskList").sortable({
        update: function (event, ui) {
            saveTaskOrder();
        }
    });
    $("#taskList").disableSelection();
}

// Função para salvar a ordem das tarefas no localStorage
function saveTaskOrder() {
    const orderedTasks = $("#taskList").sortable("toArray", { attribute: "data-task-id" });
    const newOrderTasks = orderedTasks.map(taskId => tasks.find(task => task.id === parseInt(taskId)));
    tasks = newOrderTasks;
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Atualizar a lista de tarefas no carregamento da página
filterTasks(currentFilter);

// Inicializar a ordenação das tarefas
initializeSortable();

// Atualizar a lista de tarefas no carregamento da página
filterTasks(currentFilter);
