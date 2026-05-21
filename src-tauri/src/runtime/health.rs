use std::time::Duration;

pub struct HealthChecker {
    interval: Duration,
    max_failures: u32,
    consecutive_failures: u32,
}

impl HealthChecker {
    pub fn new(interval_secs: u64, max_failures: u32) -> Self {
        Self {
            interval: Duration::from_secs(interval_secs),
            max_failures,
            consecutive_failures: 0,
        }
    }

    pub fn record_success(&mut self) {
        self.consecutive_failures = 0;
    }

    pub fn record_failure(&mut self) -> bool {
        self.consecutive_failures += 1;
        self.consecutive_failures >= self.max_failures
    }

    pub fn interval(&self) -> Duration {
        self.interval
    }
}
