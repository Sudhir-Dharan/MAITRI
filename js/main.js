async function loadComponents() {
    const components = [
        'sidebar', 'executive-dashboard', 'operational-dashboard', 'business-goals',
        'visual-workflow', 'mitra-detail', 'tools-marketplace', 'settings', 'intervention-modal', 'mitra-tasks'
    ];

    for (const component of components) {
        try {
            const response = await fetch(`components/${component}.html`);
            const text = await response.text();
            // A container for each component is expected in index.html
            const container = document.getElementById(`${component}-container`);
            if (container) {
                container.innerHTML = text;
            } else {
                console.error(`Container not found for component: ${component}`);
            }
        } catch (error) {
            console.error(`Error loading component: ${component}`, error);
        }
    }
}

function showPage(pageId) {
    // Query for pages *after* they have been loaded
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.toggle('active', page.id === pageId));

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${pageId}`);
    });

    if (pageId === 'visual-workflow') {
        // This might need a slight delay to ensure the canvas is fully rendered
        setTimeout(drawWorkflowLines, 50);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await loadComponents();

    // Now that components are loaded, initialize the rest of the app
    initializeAppLogic();
    
    // Show the initial page
    showPage('operational-dashboard');
});


function initializeAppLogic() {
    let mitraCpuChart, mitraApiChart, costBreakdownChart;

    window.showPage = showPage;

    function showMitraDetail(name, task, type) {
        document.getElementById('mitra-title').textContent = `${name} Details`;
        document.getElementById('mitra-status').textContent = 'Active';
        document.getElementById('mitra-task').textContent = task;

        // Mock Deployment Details
        document.getElementById('mitra-cloud-platform').textContent = 'AWS';
        document.getElementById('mitra-cloud-artifact').textContent = 'ECS Fargate Task';

        const llmSelect = document.getElementById('mitra-llm');
        llmSelect.innerHTML = '<option>Claude 3 Sonnet</option><option>GPT-4o</option><option>Gemini 1.5 Pro</option>';
        document.getElementById('mitra-guidelines').value = `You are a ${type} agent. Your goal is to ${task}. Adhere to SOLID principles. Prioritize clean, readable code.`;
        document.getElementById('mitra-context').value = `Project: #PROJ-101\nRepo: e-commerce-site/frontend\nRelevant files: [App.jsx, styles.css]`;

        const logEl = document.getElementById('mitra-log');
        logEl.innerHTML = '';
        const logs = [`[INFO] Starting task: ${task}`, `[DEBUG] Accessing context for ${type}...`, `[INFO] All dependencies resolved.`, `[DEBUG] Executing main logic...`, `[INFO] Task complete.`];
        logs.forEach((log, i) => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.innerHTML = `<span class="text-gray-500">${new Date().toLocaleTimeString()}</span> ${log.replace('[INFO]', '<span class="text-blue-400">[INFO]</span>').replace('[DEBUG]', '<span class="text-gray-400">[DEBUG]</span>')}`;
                logEl.appendChild(p);
                logEl.scrollTop = logEl.scrollHeight;
            }, i * 500);
        });

        const cpuData = Array.from({length: 7}, () => Math.floor(Math.random() * 40) + 10);
        const apiData = { 'GitHub': Math.floor(Math.random()*20), 'Jira': Math.floor(Math.random()*5), 'AWS': Math.floor(Math.random()*10) };
        updateMitraCharts(cpuData, apiData);

        const tasks = [
            { id: 'T-101', desc: 'Implement new login button', status: 'Done' },
            { id: 'T-102', desc: 'Refactor user authentication', status: 'In Progress' },
            { id: 'T-103', desc: 'Write unit tests for payment module', status: 'To Do' },
            { id: 'T-104', desc: 'Fix bug in search functionality', status: 'To Do' }
        ];

        const taskListEl = document.getElementById('mitra-tasks');
        taskListEl.innerHTML = tasks.map(task => `
            <div class="flex items-center justify-between p-2 rounded-md ${task.status === 'Done' ? 'bg-gray-800' : 'bg-gray-700'}">
                <span class="text-sm ${task.status === 'Done' ? 'text-gray-500 line-through' : 'text-white'}">${task.desc} (${task.id})</span>
                <span class="text-xs font-semibold ${task.status === 'Done' ? 'text-green-400' : (task.status === 'In Progress' ? 'text-blue-400' : 'text-gray-400')}">${task.status}</span>
            </div>
        `).join('');

        showPage('mitra-detail');
    }
    window.showMitraDetail = showMitraDetail;

    function toggleDropdown(button) {
        const dropdown = button.nextElementSibling;
        dropdown.classList.toggle('hidden');
    }
    window.toggleDropdown = toggleDropdown;

    function toggleArtifactDropdown(button) {
        const dropdown = button.nextElementSibling;
        dropdown.classList.toggle('hidden');
    }
    window.toggleArtifactDropdown = toggleArtifactDropdown;

    window.addEventListener('click', function(e) {
        if (!e.target.matches('.add-artifact-btn') && !e.target.closest('.artifact-dropdown')) {
            document.querySelectorAll('.artifact-dropdown').forEach(d => d.classList.add('hidden'));
        }
         if (!e.target.matches('.assign-btn') && !e.target.closest('.assign-dropdown')) {
            document.querySelectorAll('.assign-dropdown').forEach(d => d.classList.add('hidden'));
        }
    });


    function sendToMaitra(goal) {
        alert(`Goal "${goal}" has been assigned. Navigating to workflow view.`);
        showPage('visual-workflow');
    }
    window.sendToMaitra = sendToMaitra;

    function filterAgentActivity(agentType) {
        const feedItems = document.querySelectorAll('#live-feed-container > div');
        feedItems.forEach(item => {
            if (agentType === 'ALL' || item.dataset.agentType === agentType) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    window.filterAgentActivity = filterAgentActivity;

    const modalData = {
        'High-Risk Action': {
            summary: 'SRE-MITRA wants to deploy a new version of the authentication service to the production environment.',
            plan: '1. Run final pre-flight checks.\n2. Apply new Kubernetes config.\n3. Monitor rollout for 5 minutes.\n4. If stable, complete deployment.',
            impact: 'Potential Risk: High. This is a critical user-facing service. A failure could result in login outages.',
            diff: '<span class="diff-remove">- image: auth-service:v1.1</span>\n<span class="diff-add">+ image: auth-service:v1.2</span>'
        },
        'High Code Complexity': {
            summary: 'Developer-MITRA wants to refactor the core billing service.',
            plan: '1. Analyze existing service logic.\n2. Decompose into smaller microservices.\n3. Generate new services and tests.\n4. Propose migration plan.',
            impact: 'Potential Risk: Medium. Refactoring a core service could introduce subtle bugs if not carefully managed.',
            diff: '<span class="diff-remove">- class BillingService { ... }</span>\n<span class="diff-add">+ class PaymentService { ... }\n+ class InvoiceService { ... }</span>'
        },
        'High Estimated Cost': {
            summary: 'QA-MITRA wants to run a large-scale load test.',
            plan: '1. Provision 50 large EC2 instances.\n2. Run test suite for 60 minutes.\n3. Aggregate results and de-provision instances.',
            impact: 'Potential Risk: Low. Financial cost is the primary concern. No direct impact on production systems.',
            diff: '<span class="diff-remove">- instance_count: 5</span>\n<span class="diff-add">+ instance_count: 50</span>'
        },
        'Potential GDPR Compliance Violation': {
            summary: 'Developer-MITRA is attempting to process a dataset containing EU user information in a non-compliant data pipeline.',
            plan: '1. Ingest user_data_eu.csv.\n2. Load into analytics_db_us_east_1.\n3. Run aggregation query.',
            impact: 'Potential Risk: Critical. Processing EU data in a US-based server without proper consent and data transfer agreements is a major GDPR violation, risking significant fines.',
            diff: '<span class="diff-remove">- target_db: "analytics_db_eu_central_1"</span>\n<span class="diff-add">+ target_db: "analytics_db_us_east_1"</span>'
        }
    };

    function showInterventionModal(title, reason) {
        const data = modalData[reason] || {};
        document.getElementById('modal-title').textContent = `Intervention: ${title}`;
        document.getElementById('modal-summary').textContent = data.summary || 'No summary available.';
        document.getElementById('modal-reason').textContent = reason;
        document.getElementById('modal-plan').textContent = data.plan || 'No plan available.';
        document.getElementById('modal-impact').textContent = data.impact || 'No impact analysis available.';
        document.getElementById('modal-diff').innerHTML = data.diff || 'No changes to display.';
        document.getElementById('intervention-modal').classList.remove('hidden');
    }
    window.showInterventionModal = showInterventionModal;

    function closeModal() {
         document.getElementById('intervention-modal').classList.add('hidden');
    }
    window.closeModal = closeModal;

    function showCostTooltip(visible) {
        const tooltip = document.getElementById('cost-tooltip');
        if (visible) {
            tooltip.classList.remove('hidden');
        } else {
            tooltip.classList.add('hidden');
        }
    }
    window.showCostTooltip = showCostTooltip;

    function showSystemStatusTooltip(visible) {
        const tooltip = document.getElementById('system-status-tooltip');
        const detailsContainer = document.getElementById('system-health-details');

        if (visible) {
            // Mock data for system health
            const systemHealth = [
                { name: 'E-commerce Site', status: 'Operational', color: 'green' },
                { name: 'Marketing Platform', status: 'Operational', color: 'green' },
                { name: 'Campaign Engine', status: 'Degraded', color: 'orange' },
                { name: 'Shared Services', status: 'Operational', color: 'green' },
            ];

            detailsContainer.innerHTML = systemHealth.map(system => `
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-300">${system.name}</span>
                    <span class="text-sm font-semibold text-${system.color}-400">${system.status}</span>
                </div>
            `).join('');
            tooltip.classList.remove('hidden');
        } else {
            tooltip.classList.add('hidden');
        }
    }
    window.showSystemStatusTooltip = showSystemStatusTooltip;

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const navTexts = document.querySelectorAll('.nav-text');
        const title = document.getElementById('sidebar-title');
        const subtitle = document.getElementById('sidebar-subtitle');
        const userProfile = document.getElementById('user-profile');
        const toggleIcon = document.getElementById('toggle-icon');

        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-20');

        const isCollapsed = sidebar.classList.contains('w-20');
        navTexts.forEach(text => text.classList.toggle('hidden', isCollapsed));
        title.classList.toggle('hidden', isCollapsed);
        subtitle.classList.toggle('hidden', isCollapsed);
        userProfile.classList.toggle('flex', !isCollapsed);
        userProfile.classList.toggle('hidden', isCollapsed);
        toggleIcon.textContent = isCollapsed ? '→' : '←';
    }
    window.toggleSidebar = toggleSidebar;


    // Chart.js setup
    const chartColors = { teal: '#3fb950', orange: '#f78166', purple: '#bc8cff', gray: '#8b949e', bg: '#161b22', grid: '#30363d', blue: '#58a6ff' };

    new Chart(document.getElementById('costSavingsChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                { label: 'Monthly Cost (Benchmark)', data: [850, 870, 860, 880, 890, 875], borderColor: chartColors.gray, tension: 0.1, borderDash: [5, 5] },
                { label: 'MAITRA Cost', data: [840, 710, 550, 480, 450, 430], borderColor: chartColors.teal, fill: true, backgroundColor: 'rgba(63, 185, 80, 0.1)', tension: 0.4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, ticks: { callback: (v) => `$${v}k` } } } }
    });

                new Chart(document.getElementById('automationRateChart'), { type: 'doughnut', data: { labels: ['Autonomous Tasks', 'Interventions'], datasets: [{ data: [9800, 200], backgroundColor: [chartColors.teal, chartColors.orange], borderColor: chartColors.bg }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } } });
            
            // Top 5 Agents by API Calls
            const topAgentsData = [
                { name: 'DEV-MITRA-1', apiCalls: 1200, breakdown: { GitHub: 800, Jira: 300, Slack: 100 } },
                { name: 'QA-MITRA-1', apiCalls: 950, breakdown: { Jira: 600, GitHub: 250, Datadog: 100 } },
                { name: 'SRE-MITRA', apiCalls: 700, breakdown: { AWS: 500, Datadog: 200 } },
                { name: 'ARC-MITRA', apiCalls: 500, breakdown: { GitHub: 300, Jira: 200 } },
                { name: 'SEC-MITRA', apiCalls: 300, breakdown: { GitHub: 150, AWS: 150 } },
            ];

            const topAgentsContainer = document.getElementById('top-agents-api-calls');
            if (topAgentsContainer) {
                topAgentsContainer.innerHTML = topAgentsData.map((agent, index) => `
                    <div class="flex justify-between items-center p-2 rounded-md bg-[#0d1117] mb-2 relative"
                         onmouseover="showApiCallsBreakdown(event, ${index})"
                         onmouseout="hideApiCallsBreakdown()">
                        <span class="text-sm text-white">${agent.name}</span>
                        <span class="text-sm font-bold highlight-blue">${agent.apiCalls} calls</span>
                    </div>
                `).join('');
            }

            let apiCallsTooltipTimeout;

            function showApiCallsBreakdown(event, agentIndex) {
                clearTimeout(apiCallsTooltipTimeout);
                const tooltip = document.getElementById('api-calls-tooltip');
                const tooltipContent = document.getElementById('api-calls-tooltip-content');

                if (!tooltip || !tooltipContent) return;

                const agent = topAgentsData[agentIndex];
                const breakdown = agent.breakdown;

                let contentHTML = `<h4 class="font-bold text-white mb-2">${agent.name} API Calls</h4>`;
                for (const system in breakdown) {
                    contentHTML += `<div class="flex justify-between items-center text-sm text-gray-300">
                                        <span>${system}:</span>
                                        <span class="font-semibold">${breakdown[system]}</span>
                                    </div>`;
                }
                tooltipContent.innerHTML = contentHTML;

                // Position the tooltip near the mouse
                tooltip.style.left = `${event.clientX + 15}px`;
                tooltip.style.top = `${event.clientY + 15}px`;
                tooltip.classList.remove('hidden');
            }

            function hideApiCallsBreakdown() {
                apiCallsTooltipTimeout = setTimeout(() => {
                    document.getElementById('api-calls-tooltip').classList.add('hidden');
                }, 100); // Small delay to allow moving between elements
            }

            window.showApiCallsBreakdown = showApiCallsBreakdown;
            window.hideApiCallsBreakdown = hideApiCallsBreakdown;

    costBreakdownChart = new Chart(document.getElementById('costBreakdownChart'), {
        type: 'bar',
        data: { labels: ['DEV', 'QA', 'SRE', 'ARC', 'SEC'], datasets: [{ label: 'Cost ($)', data: [21.50, 12.30, 8.10, 3.50, 2.42], backgroundColor: [chartColors.blue, chartColors.teal, chartColors.purple, chartColors.orange, chartColors.gray] }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: (v) => `$${v}` } } } }
    });

    new Chart(document.getElementById('dashboardTechDebtChart'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Code Complexity', data: [85, 72, 65, 58, 55, 51], borderColor: chartColors.purple, fill: false, tension: 0.4 },
                        { label: 'Security Vulnerabilities', data: [20, 18, 15, 12, 10, 8], borderColor: chartColors.orange, fill: false, tension: 0.4 },
                        { label: 'Test Coverage (inverted)', data: [30, 25, 22, 20, 18, 15], borderColor: chartColors.teal, fill: false, tension: 0.4 }, // Lower is better
                        { label: 'Build Time (hours)', data: [5, 4.5, 4, 3.8, 3.5, 3.2], borderColor: chartColors.blue, fill: false, tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    return 'Technical Debt Breakdown - ' + context[0].label;
                                },
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.raw;
                                    return label;
                                },
                                afterBody: function(context) {
                                    const dataIndex = context[0].dataIndex;
                                    const codeComplexity = context[0].dataset.data[dataIndex];
                                    const securityVulnerabilities = context[1].dataset.data[dataIndex];
                                    const testCoverageInverted = context[2].dataset.data[dataIndex];
                                    const buildTime = context[3].dataset.data[dataIndex];

                                    // Simple mock calculation for overall tech debt score
                                    // Higher values for complexity, vulnerabilities, build time increase debt
                                    // Higher test coverage (lower inverted value) decreases debt
                                    const overallScore = (
                                        codeComplexity * 0.4 + 
                                        securityVulnerabilities * 1.5 + 
                                        testCoverageInverted * 0.8 + 
                                        buildTime * 2
                                    ).toFixed(2);

                                    return '\nOverall Tech Debt Score: ' + overallScore;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Score / Value'
                            }
                        }
                    }
                }
            });
    new Chart(document.getElementById('workAllocationChart'), { type: 'doughnut', data: { labels: ['Innovation', 'Maintenance'], datasets: [{ data: [65, 35], backgroundColor: [chartColors.blue, chartColors.gray], borderColor: chartColors.bg }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } } });
    new Chart(document.getElementById('doraChart'), {
        type: 'radar',
        data: {
            labels: ['Deployment Frequency', 'Lead Time for Changes', 'Time to Restore', 'Change Failure Rate'],
            datasets: [
                { label: 'Industry Average', data: [5, 4, 5, 6], borderColor: chartColors.gray, backgroundColor: 'rgba(139, 148, 158, 0.2)' },
                { label: 'MAITRA Performance', data: [9, 8, 9, 8], borderColor: chartColors.green, backgroundColor: 'rgba(63, 185, 80, 0.2)' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 10, ticks: { display: false } } } }
    });


    function createMitraCharts() {
        mitraCpuChart = new Chart(document.getElementById('mitraCpuChart'), { type: 'line', options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'CPU & Memory Usage (%)', color: chartColors.gray } }, scales: { y: { max: 100 } } } });
        mitraApiChart = new Chart(document.getElementById('mitraApiChart'), { type: 'bar', options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'API Calls by Tool', color: chartColors.gray } } } });
    }
    createMitraCharts();

    function updateMitraCharts(cpuData, apiData) {
        mitraCpuChart.data = { labels: ['-6m', '-5m', '-4m', '-3m', '-2m', '-1m', 'Now'], datasets: [{ label: 'CPU', data: cpuData, borderColor: chartColors.blue, tension: 0.4 }, { label: 'Memory', data: cpuData.map(d => d + Math.floor(Math.random()*10)), borderColor: chartColors.purple, tension: 0.4 }] };
        mitraApiChart.data = { labels: Object.keys(apiData), datasets: [{ label: 'Calls', data: Object.values(apiData), backgroundColor: [chartColors.teal, chartColors.orange, chartColors.blue]}] };
        mitraCpuChart.update();
        mitraApiChart.update();
    }

    function drawWorkflowLines() {
        const canvas = document.getElementById('workflow-canvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.strokeStyle = '#8b949e'; // Use a lighter gray for visibility
        ctx.lineWidth = 2;

        function getCoords(element) {
            const rect = element.getBoundingClientRect();
            const parentRect = container.getBoundingClientRect();
            return { x: rect.left - parentRect.left + rect.width / 2, y: rect.top - parentRect.top + rect.height / 2 };
        }

        const layers = ['systems', 'planning', 'dev', 'qa', 'release'];
        const nodeElements = layers.map(id => Array.from(document.querySelectorAll(`#layer-${id} .workflow-node, #layer-${id} .system-node`)));

        for (let i = 0; i < nodeElements.length - 1; i++) {
            const fromLayer = nodeElements[i];
            const toLayer = nodeElements[i+1];
            fromLayer.forEach(fromNode => {
                const from = getCoords(fromNode);
                toLayer.forEach(toNode => {
                    const to = getCoords(toNode);
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y + (fromNode.classList.contains('system-node') ? 20 : 35));
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.stroke();

                    // Draw arrowhead
                    const headlen = 10; // length of head in pixels
                    const angle = Math.atan2(to.y - from.y, to.x - from.x);
                    ctx.beginPath();
                    ctx.moveTo(to.x, to.y);
                    ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
                    ctx.moveTo(to.x, to.y);
                    ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
                    ctx.stroke();
                });
            });
        }
    }
    window.addEventListener('resize', drawWorkflowLines);

    // Mock data for operational dashboard
    const interventionQueueContainer = document.querySelector('#intervention-queue-container .space-y-4');
    const liveFeedContainer = document.querySelector('#live-feed-container');

    const interventions = [
        { title: 'Deploy `auth-v1.2` to Production', agent: 'SRE-MITRA', reason: 'High-Risk Action' },
        { title: 'Refactor `billing.service`', agent: 'Developer-MITRA', reason: 'High Code Complexity' },
        { title: 'Run load test (10k users)', agent: 'QA-MITRA', reason: 'High Estimated Cost' },
        { title: 'Process EU user data', agent: 'Developer-MITRA', reason: 'Potential GDPR Compliance Violation' }
    ];
    interventionQueueContainer.innerHTML = interventions.map(item =>
        `<div class="card p-4 border-l-4 border-orange-500"><div class="flex flex-col sm:flex-row justify-between sm:items-center"><div><p class="font-bold text-lg text-white">${item.title}</p><p class="text-sm text-gray-400">Triggered by: <span class="font-semibold highlight-teal">${item.agent}</span></p><p class="text-sm text-gray-400">Reason: <span class="font-semibold highlight-orange">${item.reason}</span></p></div><div class="flex items-center gap-2 mt-4 sm:mt-0"><button class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600" onclick="showInterventionModal('${item.title}', '${item.reason}')">Details</button><button class="px-3 py-1 rounded bg-red-600 hover:bg-red-500">Reject</button><button class="px-3 py-1 rounded bg-green-600 hover:bg-green-500">Approve</button></div></div></div>`
    ).join('');

    const feedItems = [
        { agent: 'QA', msg: 'Generated 12 new unit tests for `payment.processor` (PROJ-095).' }, { agent: 'DEV', msg: 'Committed refactor for `user.model` to GitHub (PROJ-105).' }, { agent: 'SEC', msg: 'Flagged potential XSS vulnerability in `search.js` (PROJ-112).' }, { agent: 'SRE', msg: 'Scaled staging environment pods from 2 to 3.' }, { agent: 'ARC', msg: 'Updated architecture diagram for `notif-service` (PROJ-101).' },
        { agent: 'PROD', msg: 'Created new user stories for Q3 roadmap (PROJ-115).' }, { agent: 'DEV', msg: 'Investigating build failure in `ci-pipeline-34` (PROJ-105).' }, { agent: 'QA', msg: 'Performance test on `api-v4` complete. Results normal.' }
    ];
    liveFeedContainer.innerHTML = feedItems.map(item => {
                const icon = getActivityIcon(item.msg);
                return `<div class="flex items-start gap-3" data-agent-type="${item.agent}">
                           <div class="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xl">${icon}</div>
                           <div>
                               <p class="text-sm text-white"><span class="font-bold highlight-blue">${item.agent}</span>: ${item.msg}</p>
                               <p class="text-xs text-gray-500">${Math.floor(Math.random()*20)+2} min ago</p>
                           </div>
                       </div>`;
            }).join('');

    // Drag and Drop Logic
    const goalCards = [
        { id: 'goal1', status: 'backlog', title: 'Launch new Loyalty Program', desc: 'Create a points-based system to reward repeat customers.', jira: 'PROJ-118', system: 'Marketing Platform' },
        { id: 'goal2', status: 'backlog', title: 'GDPR Compliance Audit', desc: 'Scan and update all services to ensure full GDPR compliance.', jira: 'PROJ-119', system: 'All Systems' },
        { id: 'goal3', status: 'prioritized', title: 'Implement Two-Factor Auth', desc: 'Add 2FA to the user login flow for enhanced security.', jira: 'PROJ-120', system: 'E-commerce Site' },
        { id: 'goal4', status: 'prioritized', title: 'Optimize Checkout Funnel', desc: 'Refactor the e-commerce checkout to reduce drop-off rates.', jira: 'PROJ-121', system: 'E-commerce Site' },
        { id: 'goal5', status: 'inprogress', title: 'New Dashboard Widgets', desc: 'Status: Coding (DEV-MITRA)', jira: 'PROJ-115', system: 'E-commerce Site', progress: 75, phases: [{name: 'Design', progress: 100}, {name: 'Dev', progress: 80}, {name: 'QA', progress: 20}, {name: 'Release', progress: 0}] },
        { id: 'goal6', status: 'inprogress', title: 'API Performance Testing', desc: 'Status: Testing (QA-MITRA)', jira: 'PROJ-116', system: 'All Systems', progress: 40, phases: [{name: 'Planning', progress: 100}, {name: 'Testing', progress: 40}, {name: 'Analysis', progress: 0}] },
        { id: 'goal7', status: 'completed', title: 'Mobile App Splash Screen', desc: 'Completed 3 days ago', jira: 'PROJ-109', system: 'E-commerce Site' },
        { id: 'goal8', status: 'completed', title: 'Database Schema Migration', desc: 'Completed 1 week ago', jira: 'PROJ-110', system: 'All Systems' },
    ];
    const systemColors = { 'E-commerce Site': 'bg-blue-500', 'Marketing Platform': 'bg-purple-500', 'Campaign Engine': 'bg-green-500', 'All Systems': 'bg-gray-500' };

    function renderKanban() {
        document.getElementById('backlog-cards').innerHTML = '';
        document.getElementById('prioritized-cards').innerHTML = '';
        document.getElementById('inprogress-cards').innerHTML = '';
        document.getElementById('completed-cards').innerHTML = '';

        goalCards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.id = card.id;
            cardEl.className = 'kanban-card card p-4 bg-[#0d1117] cursor-grab relative';
            cardEl.draggable = true;
            
            let systemTag = `<span class="text-xs font-semibold mr-2 px-2 py-0.5 rounded-full text-white ${systemColors[card.system] || 'bg-gray-500'}">${card.system}</span>`;
            
            if (card.status === 'inprogress' && card.progress) {
                    let phasesHTML = '';
                    if(card.phases) {
                        phasesHTML = card.phases.map(phase => `
                            <div class="mb-2">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-xs font-semibold text-gray-300">${phase.name}</span>
                                    <span class="text-xs font-bold text-white">${phase.progress}%</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-1.5">
                                    <div class="bg-green-500 h-1.5 rounded-full" style="width: ${phase.progress}%"></div>
                                </div>
                            </div>
                        `).join('');

                        cardEl.innerHTML += `
                            <div class="sdlc-tooltip card p-4">
                                <h4 class="font-bold text-white mb-3">SDLC Phases</h4>
                                ${phasesHTML}
                            </div>`;
                    }

                    cardEl.innerHTML += `
                        <div class="w-full bg-gray-700 rounded-full h-2.5 mt-3">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${card.progress}%"></div>
                        </div>`;
                }

                if (card.status === 'completed') {
                    cardEl.draggable = false;
                    cardEl.classList.add('opacity-60', 'cursor-not-allowed');
                    cardEl.innerHTML = `<div class="flex justify-between items-start"><p class="font-semibold text-gray-400 line-through">${card.title}</p><a href="#" class="text-xs text-blue-400 hover:underline flex-shrink-0">${card.jira}</a></div><div class="mt-2 mb-3">${systemTag}</div><p class="text-sm text-gray-500">${card.desc}</p>`;
                } else {
                    cardEl.innerHTML = `<div class="flex justify-between items-start"><p class="font-semibold">${card.title}</p><a href="#" class="text-xs text-blue-400 hover:underline flex-shrink-0">${card.jira}</a></div><div class="mt-2 mb-3">${systemTag}</div><p class="text-sm text-gray-400">${card.desc}</p>`;
                }

                if (card.status === 'prioritized') {
                        cardEl.innerHTML += `<div class="mt-3 relative"><button class="w-full bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-500 text-sm assign-btn" onclick="toggleDropdown(this)">Assign to...</button><div class="absolute hidden top-full mt-1 w-full bg-[#161b22] border border-gray-700 rounded-md z-10 assign-dropdown"><a href="#" class="block px-4 py-2 text-sm hover:bg-gray-700" onclick="sendToMaitra('${card.title}')">Orchestrator</a><a href="#" class="block px-4 py-2 text-sm hover:bg-gray-700" onclick="sendToMaitra('${card.title}')">Product MITRA</a></div></div>`;
                    }
            document.getElementById(`${card.status}-cards`).appendChild(cardEl);
        });
        addDragListeners();
    }

    function addDragListeners() {
        const draggables = document.querySelectorAll('.kanban-card');
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
            draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
        });
    }

    window.handleDragOver = function(e) {
        e.preventDefault();
        const column = e.currentTarget;
        column.classList.add('drag-over');
    }
    
    window.handleDragLeave = function(e) {
         const column = e.currentTarget;
         column.classList.remove('drag-over');
    }

    window.handleDrop = function(e) {
        e.preventDefault();
        const column = e.currentTarget;
        column.classList.remove('drag-over');
        const draggingCardId = document.querySelector('.dragging').id;
        const cardData = goalCards.find(c => c.id === draggingCardId);
        if (cardData) {
            cardData.status = column.id.replace('-col', '');
            renderKanban();
        }
    }
    
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(col => col.addEventListener('dragleave', handleDragLeave));


    renderKanban();


    // Dashboard tabs
    function showDashboardSection(sectionId) {
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${sectionId}-section`).classList.add('active');
        document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }
    window.showDashboardSection = showDashboardSection;

    // Settings page intervention rules
    const interventionRules = [
        { id: 'rule1', name: 'High-Risk Deployment', description: 'Requires approval for production deployments.', status: 'Active', type: 'Action' },
        { id: 'rule2', name: 'Cost Overrun (> $100)', description: 'Intervene if estimated cost exceeds $100.', status: 'Active', type: 'Cost' },
        { id: 'rule3', name: 'GDPR Compliance Check', description: 'Flag data processing in non-compliant data pipeline.', status: 'Paused', type: 'Compliance' },
        { id: 'rule4', name: 'High Code Complexity', description: 'Intervene on code changes with high cyclomatic complexity.', status: 'Active', type: 'Quality' }
    ];

    function renderInterventionRules() {
        const gridContainer = document.getElementById('intervention-rules-grid');
        if (!gridContainer) return;

        gridContainer.innerHTML = interventionRules.map(rule => `
            <div class="card p-4">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold text-white">${rule.name}</h4>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${rule.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}">${rule.status}</span>
                </div>
                <p class="text-sm text-gray-400 mb-2">${rule.description}</p>
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>Type: ${rule.type}</span>
                    <div class="flex gap-2">
                        <button class="text-blue-400 hover:underline">Edit</button>
                        <button class="text-red-400 hover:underline">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Call render function when settings page is shown
    const settingsNavLink = document.querySelector('a[href="#settings"]');
    if (settingsNavLink) {
        settingsNavLink.addEventListener('click', renderInterventionRules);
    }
}

function getActivityIcon(msg) {
    if (msg.includes('GitHub')) return '🐙';
    if (msg.includes('unit tests')) return '🧪';
    if (msg.includes('vulnerability')) return '🛡️';
    if (msg.includes('Scaled')) return '☁️';
    if (msg.includes('architecture')) return '🏗️';
    if (msg.includes('user stories')) return '📝';
    if (msg.includes('build failure')) return '❌';
    if (msg.includes('Performance test')) return '⏱️';
    return '⚙️';
}