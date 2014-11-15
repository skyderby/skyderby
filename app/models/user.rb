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

  before_save :build_profile, :assign_default_role

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable


  def self.suggestions_by_name(query)

    users = User.joins(:user_profile).where('LOWER(name) LIKE LOWER(?)', "%#{query}%")

    suggestions = []
    users.each do |x|
      suggestions << {:value => (x.name), :data => x.id}
    end
    {:query => query, :suggestions => suggestions}.to_json

  end

  def name
    self.user_profile.name
  end

  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

  def pf_status(event)
    pf = ParticipationForm.where('event_id = ? AND user_id = ?', event.id, self.id)
    if pf.present?
      pf.first.status
    end
  end

  def event_admin?(event)
    Organizer.where('event_id = ? AND user_id = ?', event.id, self.id).present? || has_role?(:admin)
  end

  def completed_profile?
    [:first_name, :last_name, :homeDZ_name,
      :jumps_total, :jumps_wingsuit,
      :jumps_last_year, :jumps_wingsuit_last_year,
      :jumps_last_3m, :jumps_wingsuit_last_3m, :phone_number,
      :height, :weight, :shirt_size].each do |x|

      if self.user_profile[x].blank?
        return false
      end

    end

    true

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
