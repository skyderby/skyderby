class UserEmailsPresenter
  def self.call(users)
    new(users).call
  end

  def initialize(users)
    @users = [users].flatten
  end

  def call
    users.map do |user|
      %("#{user.profile.name}" <#{user.email}>)
    end
  end

  private

  attr_reader :users
end
