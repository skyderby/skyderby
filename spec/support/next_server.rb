class NextServer
  NEXT_PID = Rails.root.join('tmp/pids/nextjs.pid')

  def self.start
    stop if pid

    `yarn build`
    self.pid = spawn("yarn start -p #{NEXT_PORT}")
  end

  def self.stop
    return unless pid

    Process.kill('TERM', pid)
    File.delete(NEXT_PID) if File.exist?(NEXT_PID)
  rescue Errno::ESRCH
    # Ignored
  end

  def self.pid
    File.read(NEXT_PID)&.to_i
  end

  def self.pid=(pid)
    File.open(NEXT_PID, 'w') { |f| f.puts pid }
  end
end
