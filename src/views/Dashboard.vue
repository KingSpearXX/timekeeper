<template>
  <div class="dashboard-layout">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button
        @click="toggleMobileMenu"
        class="menu-toggle"
        aria-label="Toggle menu"
      >
        <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>
      <h1 class="mobile-title">TimeKeeper</h1>
      <button @click="authStore.logout" class="mobile-logout">
        <svg class="logout-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
          />
        </svg>
      </button>
    </header>

    <!-- Mobile Drawer Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-overlay"
      @click="toggleMobileMenu"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <h2 class="sidebar-title">TimeKeeper</h2>
        <p class="sidebar-subtitle">
          Welcome, {{ authStore.user.value?.first_name }}!
        </p>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in menuItems"
          :key="item.name"
          href="#"
          class="nav-item"
          :class="{ active: item.name === currentPage }"
          @click.prevent="setCurrentPage(item.name)"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path :d="item.icon" />
          </svg>
          <span class="nav-text">{{ item.name }}</span>
        </a>

        <!-- Sign Out Menu Item -->
        <a
          href="#"
          class="nav-item nav-item-signout"
          @click.prevent="authStore.logout"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
            />
          </svg>
          <span class="nav-text">Sign Out</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-header">
        <h1 class="page-title">{{ currentPage }}</h1>
        <p class="page-subtitle">{{ getPageSubtitle() }}</p>
      </div>

      <div class="content-body">
        <!-- Dashboard Content -->
        <!-- Dashboard Content -->
        <div v-if="currentPage === 'Dashboard'" class="dashboard-content">
          <!-- Loading State for Dashboard -->
          <LoadingSpinner
            v-if="isLoading"
            text="Loading dashboard data..."
            size="medium"
            :fullscreen="false"
          />

          <!-- Dashboard Grid -->
          <div v-else class="dashboard-grid">
            <!-- Quick Actions -->
            <div class="card">
              <h3 class="card-title">Quick Actions</h3>
              <div class="quick-actions">
                <button
                  @click="handleClockAction"
                  :class="['action-button', clockButtonClass]"
                  :disabled="isLoading"
                >
                  <svg
                    class="action-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"
                    />
                  </svg>
                  {{ isLoading ? "Loading..." : clockButtonText }}
                </button>
              </div>
            </div>

            <!-- Today's Summary & Status -->
            <div class="card">
              <h3 class="card-title">Today's Summary & Status</h3>

              <!-- Current Status -->
              <div class="status-section">
                <div class="status-indicator">
                  <div :class="['status-dot', currentStatus.statusClass]"></div>
                  <span class="status-text">{{
                    isLoading ? "Loading..." : currentStatus.status
                  }}</span>
                </div>
                <p class="status-time">
                  Last activity:
                  {{ isLoading ? "..." : currentStatus.lastActivity }}
                </p>
              </div>

              <!-- Today's Stats -->
              <div class="summary-stats">
                <div class="stat">
                  <span class="stat-label">Hours Worked Today</span>
                  <span class="stat-value">{{
                    isLoading ? "..." : todayStats.hoursWorked
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Logs Table -->
          <div class="time-logs-section">
            <h3 class="section-title">Recent Time Logs</h3>
            <div class="table-card">
              <LoadingSpinner
                v-if="isLoading"
                text="Loading time logs..."
                size="small"
                :fullscreen="false"
              />

              <div v-else-if="paginatedLogs.length === 0" class="table-empty">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"
                  />
                </svg>
                <h4>No Time Logs Found</h4>
                <p>Start tracking your time by clicking "Clock In" above.</p>
              </div>

              <div v-else class="table-container">
                <table class="time-logs-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(log, index) in paginatedLogs"
                      :key="log.id"
                      :class="getRowClass(log, index)"
                    >
                      <td>{{ formatDayAndDate(log.time_in) }}</td>
                      <td>{{ formatTime(log.time_in) }}</td>
                      <td>
                        {{ log.time_out ? formatTime(log.time_out) : "Active" }}
                      </td>
                      <td>{{ calculateSessionDuration(log) }}</td>
                      <td>
                        <span
                          :class="[
                            'status-badge',
                            log.time_out ? 'completed' : 'active',
                          ]"
                        >
                          {{ log.time_out ? "Completed" : "In Progress" }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="pagination">
                  <button
                    @click="currentPageNum = currentPageNum - 1"
                    :disabled="currentPageNum === 1"
                    class="pagination-btn"
                  >
                    Previous
                  </button>

                  <span class="pagination-info">
                    Page {{ currentPageNum }} of {{ totalPages }} ({{
                      allTimeLogs.length
                    }}
                    total logs)
                  </span>

                  <button
                    @click="currentPageNum = currentPageNum + 1"
                    :disabled="currentPageNum === totalPages"
                    class="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule Content -->
        <!-- Schedule Content -->
        <div v-else-if="currentPage === 'Schedule'" class="schedule-content">
          <LoadingSpinner
            v-if="isLoadingSchedules"
            text="Loading schedule..."
            size="medium"
            :fullscreen="false"
          />

          <div
            v-else-if="userSchedules.length === 0"
            class="placeholder-content"
          >
            <svg
              class="placeholder-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
              />
            </svg>
            <h3>No Schedule Found</h3>
            <p>No work schedule has been assigned to your account</p>
          </div>

          <div v-else class="schedule-grid">
            <!-- Weekly Summary Card -->
            <div class="card schedule-summary">
              <h3 class="card-title">Weekly Summary</h3>
              <div class="summary-stats">
                <div class="stat">
                  <span class="stat-label">Total Scheduled Hours</span>
                  <span class="stat-value"
                    >{{
                      schedulesService
                        .calculateWeeklyHours(userSchedules)
                        .toFixed(1)
                    }}h</span
                  >
                </div>
                <div class="stat">
                  <span class="stat-label">Working Days</span>
                  <span class="stat-value"
                    >{{ userSchedules.length }} days</span
                  >
                </div>
              </div>
            </div>

            <!-- Daily Schedule Cards -->
            <div
              v-for="schedule in userSchedules"
              :key="schedule.id"
              class="card schedule-day-card"
            >
              <h4 class="day-title">
                {{ schedulesService.formatDayName(schedule.day_of_week) }}
              </h4>
              <div class="time-range">
                <div class="time-block">
                  <span class="time-label">Start</span>
                  <span class="time-value">{{
                    schedulesService.formatTime(schedule.time_start)
                  }}</span>
                </div>
                <div class="time-separator">→</div>
                <div class="time-block">
                  <span class="time-label">End</span>
                  <span class="time-value">{{
                    schedulesService.formatTime(schedule.time_end)
                  }}</span>
                </div>
              </div>
              <div class="day-hours">
                {{
                  schedulesService
                    .calculateDayHours(schedule.time_start, schedule.time_end)
                    .toFixed(1)
                }}
                hours
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Content -->
        <div v-else-if="currentPage === 'Wallet'" class="wallet-content">
          <!-- Loading State -->
          <LoadingSpinner
            v-if="isLoadingWallet"
            text="Loading wallet data..."
            size="medium"
            :fullscreen="false"
          />

          <!-- No Employee Profile -->
          <div v-else-if="!hasEmployeeProfile" class="placeholder-content">
            <svg
              class="placeholder-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <h3>No Employee Profile Found</h3>
            <p>
              Your employee profile has not been set up yet. Please contact your
              administrator to access wallet features.
            </p>
          </div>

          <!-- Wallet Dashboard -->
          <div v-else class="wallet-dashboard">
            <!-- Wallet Summary Cards -->
            <div class="wallet-summary">
              <!-- Current Balance Card -->
              <div class="card balance-card">
                <h3 class="card-title">Current Balance</h3>
                <div class="balance-amount">
                  {{ walletService.formatCurrency(currentWalletBalance) }}
                </div>
                <p class="balance-subtitle">Available for withdrawal</p>
              </div>

              <!-- Quick Actions Card -->
              <div class="card actions-card">
                <h3 class="card-title">Quick Actions</h3>
                <div class="wallet-actions">
                  <button
                    @click="showWithdrawModal = true"
                    :disabled="currentWalletBalance <= 0"
                    class="action-button primary"
                  >
                    <svg
                      class="action-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"
                      />
                    </svg>
                    {{ currentWalletBalance <= 0 ? "No Balance" : "Withdraw" }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Wallet Logs Table -->
            <div class="wallet-logs-section">
              <h3 class="section-title">Transaction History</h3>
              <div class="table-card">
                <LoadingSpinner
                  v-if="isLoadingWalletLogs"
                  text="Loading transaction history..."
                  size="small"
                  :fullscreen="false"
                />

                <div
                  v-else-if="paginatedWalletLogs.length === 0"
                  class="table-empty"
                >
                  <svg
                    class="empty-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                    />
                  </svg>
                  <h4>No Transactions Found</h4>
                  <p>
                    Your transaction history will appear here once you start
                    earning.
                  </p>
                </div>

                <div v-else class="table-container">
                  <table class="wallet-logs-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Wallet Value</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="log in paginatedWalletLogs" :key="log.id">
                        <td>
                          <div class="date-time">
                            <div class="date">
                              {{ walletService.formatDate(log.date_created) }}
                            </div>
                            <div class="time">
                              {{ walletService.formatTime(log.date_created) }}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="wallet-value">
                            {{ walletService.formatCurrency(log.wallet_value) }}
                          </span>
                        </td>
                        <td>
                          <span class="remarks">
                            {{ log.remarks || "-" }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Pagination -->
                  <div v-if="walletTotalPages > 1" class="pagination">
                    <button
                      @click="goToWalletPage(currentWalletPage - 1)"
                      :disabled="currentWalletPage === 1 || isLoadingWalletLogs"
                      class="pagination-btn"
                    >
                      Previous
                    </button>

                    <span class="pagination-info">
                      Page {{ currentWalletPage }} of {{ walletTotalPages }} ({{
                        walletTotalCount
                      }}
                      total transactions)
                    </span>

                    <button
                      @click="goToWalletPage(currentWalletPage + 1)"
                      :disabled="
                        currentWalletPage === walletTotalPages ||
                        isLoadingWalletLogs
                      "
                      class="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Withdraw Modal -->
          <div
            v-if="showWithdrawModal"
            class="modal-overlay"
            @click="closeWithdrawModal"
          >
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>Withdraw Funds</h3>
                <button @click="closeWithdrawModal" class="modal-close">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                </button>
              </div>

              <div class="modal-body">
                <div class="current-balance">
                  <span class="balance-label">Available Balance:</span>
                  <span class="balance-amount">{{
                    walletService.formatCurrency(currentWalletBalance)
                  }}</span>
                </div>

                <div class="form-group">
                  <label for="withdraw-amount">Withdrawal Amount</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">₱</span>
                    <input
                      id="withdraw-amount"
                      v-model="withdrawAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      :max="currentWalletBalance"
                      class="form-input with-prefix"
                      placeholder="0.00"
                      @input="validateWithdrawAmount"
                    />
                    <select
                      id="withdraw-type"
                      v-model="withdrawType"
                      class="form-input currency-select"
                    >
                      <option value="manual">CASH</option>
                      <option value="ewallet" selected>EWALLET</option>
                    </select>
                  </div>
                  <div v-if="withdrawError" class="error-message">
                    {{ withdrawError }}
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button @click="closeWithdrawModal" class="btn secondary">
                  Cancel
                </button>
                <button
                  @click="processWithdraw"
                  :disabled="!isWithdrawValid || isProcessingWithdraw"
                  class="btn primary"
                >
                  {{ isProcessingWithdraw ? "Processing..." : "Withdraw" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { timeLogsService } from "@/services/timeLogs";
import { schedulesService } from "@/services/schedules";
import { walletService } from "@/services/wallet";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const router = useRouter();
const authStore = useAuthStore();

// Mobile menu state
const isMobileMenuOpen = ref(false);
const currentPage = ref("Dashboard");

// Time tracking state
const isLoading = ref(true);
const allTimeLogs = ref([]);
const currentPageNum = ref(1);
const itemsPerPage = 8;

const currentStatus = ref({
  isClockedIn: false,
  status: "Clocked Out",
  lastActivity: "Never",
  statusClass: "clocked-out",
});
const todayStats = ref({
  hoursWorked: "0.00",
});

// Schedule state
const userSchedules = ref([]);
const isLoadingSchedules = ref(false);

// Wallet state
const isLoadingWallet = ref(false);
const isLoadingWalletLogs = ref(false);
const hasEmployeeProfile = ref(false);
const currentWalletBalance = ref(0);
const allWalletLogs = ref([]);
const currentWalletPage = ref(1);
const walletItemsPerPage = 10;
const walletTotalCount = ref(0);

// Withdraw modal state
const showWithdrawModal = ref(false);
const withdrawAmount = ref("");
const withdrawType = ref("ewallet"); // 'ewallet' or 'manual'
const withdrawReason = ref("");
const withdrawError = ref("");
const isProcessingWithdraw = ref(false);

// Menu items with icons
const menuItems = reactive([
  {
    name: "Dashboard",
    icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  },
  {
    name: "Schedule",
    icon: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
  },
  {
    name: "Wallet",
    icon: "M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  },
  {
    name: "Profile",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  },
]);

// Computed properties
const clockButtonText = computed(() => {
  return currentStatus.value.isClockedIn ? "Clock Out" : "Clock In";
});

const clockButtonClass = computed(() => {
  return currentStatus.value.isClockedIn ? "secondary" : "primary";
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(allTimeLogs.value.length / itemsPerPage);
});

const paginatedLogs = computed(() => {
  const start = (currentPageNum.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allTimeLogs.value.slice(start, end);
});

// Wallet computed properties
const walletTotalPages = computed(() => {
  return Math.ceil(walletTotalCount.value / walletItemsPerPage);
});

const paginatedWalletLogs = computed(() => {
  // Since we're fetching paginated data from the server,
  // we return the data as-is from the API
  return allWalletLogs.value;
});

const isWithdrawValid = computed(() => {
  const validation = walletService.validateWithdrawAmount(
    withdrawAmount.value,
    currentWalletBalance.value
  );
  return validation.valid && !withdrawError.value;
});

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const setCurrentPage = (page) => {
  if (page === "Profile") {
    // Route to the dedicated Profile page
    router.push("/profile");
    isMobileMenuOpen.value = false;
    return;
  }

  currentPage.value = page;
  isMobileMenuOpen.value = false;

  // Load specific page data
  if (page === "Schedule") {
    loadUserSchedules();
  } else if (page === "Wallet") {
    // Reset wallet pagination when switching to wallet page
    currentWalletPage.value = 1;
    loadWalletData();
  }
};

const getPageSubtitle = () => {
  const subtitles = {
    Dashboard: "Overview of your time tracking activity",
    Schedule: "View and manage your work schedule",
    Wallet: "Track your earnings and payments",
  };
  return subtitles[currentPage.value] || "";
};

// Table formatting methods
const formatDayAndDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return "Today";
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const dateFormatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${dayOfWeek}, ${dateFormatted}`;
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getRowClass = (log, index) => {
  const today = new Date().toDateString();
  const logDate = new Date(log.time_in).toDateString();
  const isToday = logDate === today;

  return {
    "today-row": isToday,
    "active-session": !log.time_out, // Session is still active
    "completed-session": !!log.time_out, // Session is completed
  };
};

const calculateSessionDuration = (log) => {
  if (!log.time_in) return "-";

  const timeIn = new Date(log.time_in);
  // For active sessions, use current time; for completed sessions, use time_out
  const timeOut = log.time_out ? new Date(log.time_out) : new Date();

  // Calculate duration in milliseconds, then convert to hours
  const durationMs = timeOut.getTime() - timeIn.getTime();

  if (durationMs < 0) return "-";

  // Convert to total minutes for more accurate calculation
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

const loadUserSchedules = async () => {
  try {
    isLoadingSchedules.value = true;
    const userId = authStore.user.value?.id;

    if (!userId) {
      console.error("No user ID found for schedules");
      return;
    }

    // Ensure we have a valid token
    const hasValidToken = await authStore.ensureValidToken();

    if (!hasValidToken) {
      console.error("No valid authentication token found for schedules");
      return;
    }

    console.log("Loading schedules for user:", userId);

    // Get user's schedules
    const schedules = await schedulesService.getUserSchedules(userId);

    // Sort schedules by day (Monday first)
    userSchedules.value = schedulesService.sortSchedulesByDay(schedules);

    console.log("Schedules loaded:", userSchedules.value);
  } catch (error) {
    console.error("Error loading schedules:", error);
  } finally {
    isLoadingSchedules.value = false;
  }
};

const loadWalletData = async () => {
  try {
    isLoadingWallet.value = true;
    const userId = authStore.user.value?.id;

    if (!userId) {
      console.error("No user ID found for wallet");
      return;
    }

    console.log("Loading wallet data for user:", userId);

    // Load wallet balance first
    const balanceData = await walletService.getUserWalletBalance(userId);
    currentWalletBalance.value = balanceData.balance;
    hasEmployeeProfile.value = balanceData.profileId !== null;

    if (hasEmployeeProfile.value) {
      // Load wallet logs
      await loadWalletLogs();
    }
  } catch (error) {
    console.error("Error loading wallet data:", error);
    hasEmployeeProfile.value = false;
    currentWalletBalance.value = 0;
  } finally {
    isLoadingWallet.value = false;
  }
};

const loadWalletLogs = async () => {
  try {
    isLoadingWalletLogs.value = true;
    const userId = authStore.user.value?.id;

    if (!userId) {
      console.error("No user ID found for wallet logs");
      return;
    }

    console.log("Loading wallet logs for user:", userId);

    // Get wallet logs with pagination
    const result = await walletService.getUserWalletLogs(
      userId,
      currentWalletPage.value,
      walletItemsPerPage
    );

    allWalletLogs.value = result.data;
    walletTotalCount.value = result.totalCount;
  } catch (error) {
    console.error("Error loading wallet logs:", error);
    allWalletLogs.value = [];
    walletTotalCount.value = 0;
  } finally {
    isLoadingWalletLogs.value = false;
  }
};

const validateWithdrawAmount = () => {
  const validation = walletService.validateWithdrawAmount(
    withdrawAmount.value,
    currentWalletBalance.value
  );
  withdrawError.value = validation.valid ? "" : validation.message;
};

const closeWithdrawModal = () => {
  showWithdrawModal.value = false;
  withdrawAmount.value = "";
  withdrawReason.value = "";
  withdrawError.value = "";
};

const processWithdraw = async () => {
  try {
    isProcessingWithdraw.value = true;

    // Validate amount one more time
    const validation = walletService.validateWithdrawAmount(
      withdrawAmount.value,
      currentWalletBalance.value
    );
    if (!validation.valid) {
      withdrawError.value = validation.message;
      return;
    }

    // Create withdrawal record in wallet_log
    const withdrawalRecord = await walletService.createWithdrawal(
      authStore.user.value?.id,
      withdrawAmount.value,
      withdrawType.value
    );

    alert(
      "Withdrawal request has been submitted successfully! The amount will be processed and reflected in your balance shortly."
    );

    closeWithdrawModal();

    // Reload wallet data to reflect the new withdrawal record
    await loadWalletData();
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    alert("Failed to process withdrawal. Please try again.");
  } finally {
    isProcessingWithdraw.value = false;
  }
};

const goToWalletPage = async (page) => {
  try {
    if (page < 1 || page > walletTotalPages.value) {
      return; // Invalid page
    }

    currentWalletPage.value = page;
    await loadWalletLogs();
  } catch (error) {
    console.error("Error loading wallet page:", error);
  }
};

const loadUserTimeData = async () => {
  try {
    isLoading.value = true;
    const userId = authStore.user.value?.id;

    if (!userId) {
      console.error("No user ID found");
      return;
    }

    // Ensure we have a valid token
    const hasValidToken = await authStore.ensureValidToken();

    if (!hasValidToken) {
      console.error("No valid authentication token found");
      window.location.href = "/login";
      return;
    }

    console.log("Loading time data for user:", userId);

    // Get user's time logs
    const timeLogs = await timeLogsService.getUserTimeLogs(userId);

    // Store all logs for the table
    allTimeLogs.value = timeLogs;

    const latestLog = timeLogs.length > 0 ? timeLogs[0] : null;

    // Update current status
    currentStatus.value = timeLogsService.getCurrentStatus(latestLog);

    // Calculate today's stats
    todayStats.value = timeLogsService.calculateTodayStats(timeLogs);

    console.log("Time data loaded:", {
      currentStatus: currentStatus.value,
      todayStats: todayStats.value,
      totalLogs: timeLogs.length,
    });
  } catch (error) {
    console.error("Error loading time data:", error);

    // If it's an auth error, redirect to login
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("authentication")
    ) {
      console.log("Authentication error, redirecting to login");
      localStorage.removeItem("directus_token");
      window.location.href = "/login";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleClockAction = async () => {
  try {
    const userId = authStore.user.value?.id;

    if (!userId) {
      console.error("No user ID found");
      return;
    }

    // Ensure we have a valid token before proceeding
    const hasValidToken = await authStore.ensureValidToken();

    if (!hasValidToken) {
      console.error("No valid authentication token found");
      window.location.href = "/login";
      return;
    }

    const actionText = currentStatus.value.isClockedIn
      ? "Clocking Out"
      : "Clocking In";
    console.log(`${actionText}...`);

    // Use the new handleClockAction method that automatically determines clock in/out
    const result = await timeLogsService.handleClockAction(userId);
    console.log("Clock action result:", result);

    // Reload data to update status
    await loadUserTimeData();

    console.log(
      `${
        result.action === "clock_in" ? "Clock In" : "Clock Out"
      } completed successfully!`
    );
  } catch (error) {
    console.error("Error with clock action:", error);

    // If it's an auth error, redirect to login
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("authentication")
    ) {
      console.log("Authentication error, redirecting to login");
      localStorage.removeItem("directus_token");
      window.location.href = "/login";
    } else {
      // Show user-friendly error
      alert(
        `Failed to ${
          currentStatus.value.isClockedIn ? "clock out" : "clock in"
        }. Please try again.`
      );
    }
  }
};

onMounted(async () => {
  console.log("Dashboard mounted, checking authentication...");

  // Check if user is authenticated
  if (!authStore.user.value) {
    console.log("No user found, checking auth...");
    const isAuthenticated = await authStore.checkAuth();

    if (!isAuthenticated) {
      console.log("Authentication failed, redirecting to login");
      window.location.href = "/login";
      return;
    }
  }

  // Load time tracking data
  if (authStore.user.value) {
    await loadUserTimeData();
  }
});
</script>

<style scoped>
/* Layout */
.dashboard-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  box-sizing: border-box;
}

/* Mobile Header */
.mobile-header {
  display: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-toggle,
.mobile-logout {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.menu-toggle:hover,
.mobile-logout:hover {
  background: rgba(102, 126, 234, 0.1);
}

.menu-icon,
.logout-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
}

.mobile-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
  margin: 0;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1001;
}

/* Sidebar */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1002;
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.sidebar-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 500;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.925rem;
}

.nav-item-signout {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: #ef4444 !important;
}

.nav-item-signout:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #dc2626 !important;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.logout-button:hover {
  background: #ef4444;
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.content-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.content-body {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  min-height: calc(100vh - 200px);
  width: 100%;
  box-sizing: border-box;
}

/* Dashboard Content */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 1.125rem;
  min-height: 60px;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #e5e7eb;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-icon {
  width: 24px;
  height: 24px;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  font-size: 1.25rem;
  color: #1f2937;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.clocked-out {
  background: #ef4444;
}

.status-dot.clocked-in {
  background: #10b981;
}

.status-text {
  font-weight: 500;
  color: #374151;
}

.status-time {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Placeholder Content */
.placeholder-content {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #d1d5db;
}

.placeholder-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.placeholder-content p {
  margin: 0;
  font-size: 0.925rem;
}

/* Time Logs Table Styles */
.time-logs-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.table-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.table-loading {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.table-empty {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.table-empty h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.table-empty p {
  margin: 0;
  font-size: 0.925rem;
}

.table-container {
  overflow-x: auto;
}

.time-logs-table {
  width: 100%;
  border-collapse: collapse;
}

.time-logs-table th {
  background: #f9fafb;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.time-logs-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
  font-size: 0.875rem;
}

.time-logs-table tr:hover {
  background: #f9fafb;
}

.today-row {
  background: rgba(102, 126, 234, 0.05) !important;
}

.today-row:hover {
  background: rgba(102, 126, 234, 0.1) !important;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.active {
  background: #dbeafe;
  color: #1e40af;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Row styling for different session states */
.active-session {
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid #3b82f6;
}

.completed-session {
  background: rgba(16, 185, 129, 0.05);
  border-left: 3px solid #10b981;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Schedule Styles */
.schedule-content {
  width: 100%;
}

.loading-content {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.schedule-summary {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.schedule-summary .card-title {
  color: white;
}

.schedule-summary .stat-label {
  color: rgba(255, 255, 255, 0.8);
}

.schedule-summary .stat-value {
  color: white;
  font-size: 1.5rem;
}

.schedule-day-card {
  text-align: center;
  transition: transform 0.2s;
}

.schedule-day-card:hover {
  transform: translateY(-2px);
}

.day-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 1rem 0;
}

.time-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.time-value {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.time-separator {
  color: #667eea;
  font-size: 1.25rem;
  font-weight: 600;
}

.day-hours {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Wallet Styles */
.wallet-content {
  width: 100%;
}

.wallet-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.wallet-summary {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.balance-card .card-title {
  color: white;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.balance-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
}

.actions-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wallet-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wallet-logs-section {
  width: 100%;
}

.wallet-logs-table {
  width: 100%;
  border-collapse: collapse;
}

.wallet-logs-table th {
  background: #f9fafb;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.wallet-logs-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
  font-size: 0.875rem;
}

.wallet-logs-table tr:hover {
  background: #f9fafb;
}

.date-time {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date {
  font-weight: 500;
  color: #374151;
}

.time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.transaction-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.transaction-badge.earning {
  background: #d1fae5;
  color: #065f46;
}

.transaction-badge.withdrawal {
  background: #fee2e2;
  color: #991b1b;
}

.transaction-badge.adjustment {
  background: #fef3c7;
  color: #92400e;
}

.transaction-icon {
  width: 12px;
  height: 12px;
}

.amount {
  font-weight: 600;
}

.amount.positive {
  color: #059669;
}

.amount.negative {
  color: #dc2626;
}

.wallet-value {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.remarks {
  color: #6b7280;
  font-style: italic;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remarks:empty::before {
  content: "-";
  color: #9ca3af;
  font-style: normal;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-close svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.balance-label {
  font-weight: 500;
  color: #374151;
}

.current-balance .balance-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.925rem;
  transition: all 0.2s;
  background: white;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
  pointer-events: none;
}

.form-input.with-prefix {
  padding-left: 2rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.925rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
} /* Mobile Styles */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: calc(70px + 1rem);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .content-body {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .quick-actions {
    gap: 0.5rem;
  }

  .placeholder-content {
    padding: 2rem 1rem;
  }

  .placeholder-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .time-logs-section {
    margin-top: 1rem;
  }

  .table-card {
    border-radius: 8px;
  }

  .time-logs-table th,
  .time-logs-table td {
    padding: 0.5rem;
    font-size: 0.8125rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }

  .pagination-info {
    order: -1;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .time-range {
    gap: 0.75rem;
  }

  /* Wallet Mobile Styles */
  .wallet-summary {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .balance-amount {
    font-size: 2rem;
  }

  .wallet-logs-table th,
  .wallet-logs-table td {
    padding: 0.5rem;
    font-size: 0.8125rem;
  }

  .date-time {
    gap: 0.125rem;
  }

  .transaction-badge {
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
  }

  .modal-content {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: calc(70px + 0.75rem);
  }

  .content-body {
    padding: 1rem;
  }

  .sidebar {
    width: 100vw;
  }
}
</style>
