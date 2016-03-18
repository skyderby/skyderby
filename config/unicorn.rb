# set path to application
app_dir = File.expand_path('../..', __FILE__)
working_directory app_dir

# Listen on a tcp port or unix socket.
listen ENV['LISTEN_ON']

# Go with at least 1 per CPU core, a higher amount will usually help for fast
# responses such as reading from a cache.
worker_processes ENV['WORKER_PROCESSES'].to_i

# Combine Ruby 2.0.0dev or REE with "preload_app true" for memory savings:
# http://rubyenterpriseedition.com/faq.html#adapt_apps_for_cow
preload_app true

# Use a shorter timeout instead of the 60s default. If you are handling large
# uploads you may want to increase this.
timeout 30

# Logging
stderr_path "#{app_dir}/log/unicorn.stderr.log"
stdout_path "#{app_dir}/log/unicorn.stdout.log"

# # Set master PID location
pid '/tmp/pids/unicorn.pid'
