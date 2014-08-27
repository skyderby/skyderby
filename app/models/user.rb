class User < ActiveRecord::Base

  has_one :user_profile

  has_many :user_wingsuits, :dependent => :destroy
  has_many :wingsuits, :through => :user_wingsuits

  has_many :tracks, :dependent => :destroy

  has_many :competitors
  has_many :events, :through => :competitors

  has_many :participation_forms
  has_many :invitations

  has_many :assignments
  has_many :roles, :through => :assignments

  before_save :build_profile

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable


  def self.search_by_name query
    User.where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
  end


  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

  def has_pf?(event)
    event.participation_forms.include? self
  end

  def event_admin?(event)
    event.organizers.include?(self) || has_role?(:admin)
  end

  private

  def build_profile
    if self.new_record?
      self.user_profile = UserProfile.new(:user => self, :last_name => '', :first_name => '')
    end
  end
end
