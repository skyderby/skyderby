class User < ActiveRecord::Base

  has_one :user_profile

  has_many :tracks, :dependent => :destroy

  has_many :competitors
  has_many :events, :through => :competitors

  has_many :assignments
  has_many :roles, :through => :assignments

  before_save :build_profile, :assign_default_role

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable


  def self.suggestions_by_name(query)

    users = User.joins(:user_profile).where('LOWER(name) LIKE LOWER(?)', "%#{query}%")

    suggestions = []
    users.each do |x|
      suggestions << {:value => (x.name), :id => x.id ,:profile_id => x.user_profile.id, :last_name => x.user_profile.last_name, :first_name => x.user_profile.first_name}
    end
    {:query => query, :suggestions => suggestions}.to_json

  end

  def name
    self.user_profile.name
  end

  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

  private

  def build_profile
    if self.new_record?
      self.user_profile = UserProfile.new(:user => self, :last_name => '', :first_name => '')
    end
  end

  def assign_default_role
    if self.new_record?
      self.assignments << Assignment.new(:user => self, :role => Role.find_by(:name => 'user'))
    end
  end
end
