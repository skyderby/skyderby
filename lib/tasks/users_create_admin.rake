namespace :users do
  task create_admin: [:environment] do
    print 'Input name: '
    name = STDIN.gets.strip

    print 'Input email: '
    email = STDIN.gets.strip

    puts 'Input password: '
    password = STDIN.noecho(&:gets)

    puts 'Confirm password: '
    confirmation = STDIN.noecho(&:gets)

    if password == confirmation
      record = User.create(name: name,
                           email: email,
                           password: password,
                           confirmed_at: DateTime.current)

      record.errors.map { |field, message| p "#{field} #{message}" }

      if record.persisted?
        puts '---'
        puts "Created user #{record.name} with email #{record.email}"
      end

      add_admin_role(record)
    else
      puts 'Password is not equal with confirmation.'
    end
  end

  def add_admin_role(user)
    return unless user.persisted?
    role = Role.find_by(name: :admin)
    user.assignments.create!(role: role)
    puts 'Role admin added'
  end
end
