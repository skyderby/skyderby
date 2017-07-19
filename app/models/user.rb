# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string(510)      default(""), not null
#  encrypted_password     :string(510)      default(""), not null
#  reset_password_token   :string(510)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(510)
#  last_sign_in_ip        :string(510)
#  created_at             :datetime
#  updated_at             :datetime
#  confirmation_token     :string(510)
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string(510)
#

class User < ApplicationRecord
  attr_accessor :name

  has_one :profile, as: :owner, dependent: :nullify

  has_many :competitors
  has_many :events, through: :competitors

  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments

  scope :admins, -> { joins(:assignments).where(assignments: { role: Role.admin }) }
  before_create :build_profile, :assign_default_role

  delegate :organizer_of_events, to: :profile, allow_nil: true

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable

  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

  # Using ActiveJob to deliver messages in background
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end

  private

  def build_profile
    create_profile(name: name)
  end

  def assign_default_role
    assignments << Assignment.new(role: Role.find_by(name: 'user'))
  end
end
