task :before_assets_precompile do
  system('yarn')
end

Rake::Task['assets:precompile'].enhance ['before_assets_precompile']
