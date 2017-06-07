workers ENV.fetch('WEB_CONCURRENCY') { 1 }.to_i
threads_count = ENV.fetch('RAILS_MAX_THREADS') { 5 }.to_i
threads threads_count, threads_count

preload_app!

port        ENV.fetch('PORT') { 3000 }
environment ENV.fetch('RAILS_ENV') { 'development' }

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end
