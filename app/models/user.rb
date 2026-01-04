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
  include ParticipantOfEvents
  include User::Omniauth

  pay_customer default_payment_processor: :stripe

  has_one :profile, as: :owner, dependent: :nullify, inverse_of: :owner

  scope :admins, -> { where('? = ANY(roles)', 'admin') }

  accepts_nested_attributes_for :profile

  delegate :name, to: :profile, allow_nil: true

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, omniauth_providers: %i[google_oauth2]

  def role?(role) = roles.include? role.to_s

  def admin? = role?(:admin)

  def registered? = true

  def subscription_active?
    return true if admin?

    stripe_processor&.subscription&.active? || lifetime_subscription?
  end

  def lifetime_subscription?
    stripe_processor&.charges&.succeeded&.any? { |c| c.metadata['type'] == 'lifetime' }
  end

  def stripe_processor
    pay_customers.find_by(processor: :stripe)
  end

  # Using ActiveJob to deliver messages in background
  def send_devise_notification(notification, *)
    devise_mailer.send(notification, self, *).deliver_later
  end

  def dashboard = admin? ? AdminDashboard.new(self) : Dashboard.new(self)

  class << self
    def search(query)
      return all if query.blank?

      relation = left_outer_joins(:profile)

      relation.where('unaccent(email) ILIKE unaccent(?)', "%#{query}%")
              .or(relation.where(users: { id: query }))
              .or(relation.where('unaccent(profiles.name) ILIKE unaccent(?)', "%#{query}%"))
    end

    def search_by_name(query)
      return all if query.blank?

      left_outer_joins(:profile).where('unaccent(profiles.name) ILIKE unaccent(?)', "%#{query}%")
    end
  end
end
