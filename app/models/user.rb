class User < ActiveRecord::Base
  has_one :user_profile

  has_many :tracks, dependent: :destroy

  has_many :competitors
  has_many :events, through: :competitors

  has_many :assignments
  has_many :roles, through: :assignments

  before_save :build_profile, :assign_default_role

  attr_accessor :name

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable

  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

  private

  def build_profile
    if self.new_record?
      UserProfile.new(user: self, name: self.name)
    end
  end

  def assign_default_role
    if self.new_record?
      self.assignments << Assignment.new(user: self, role: Role.find_by(name: 'user'))
    end
  end
end
