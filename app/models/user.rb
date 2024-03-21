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

  has_one :profile, as: :owner, dependent: :nullify, inverse_of: :owner

  scope :admins, -> { where('? = ANY(roles)', 'admin') }

  accepts_nested_attributes_for :profile

  after_initialize do
    build_profile if new_record? && profile.blank?
  end

  delegate :name, to: :profile, allow_nil: true

  # Include default devise modules. Others available are:
  # :lockable, :timeoutable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, omniauth_providers: %i[facebook]

  def role?(role) = roles.include? role.to_s

  def admin? = role?(:admin)

  def registered? = true

  # Using ActiveJob to deliver messages in background
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end

  private

  class << self
    def search(query)
      return all if query.blank?

      relation = left_outer_joins(:profile)

      relation.where('LOWER(email) LIKE LOWER(?)', "%#{query}%")
              .or(relation.where(users: { id: query }))
              .or(relation.where('LOWER(profiles.name) LIKE LOWER(?)', "%#{query}%"))
    end

    def search_by_name(query)
      return all if query.blank?

      left_outer_joins(:profile).where('LOWER(profiles.name) LIKE LOWER(?)', "%#{query}%")
    end
  end
end
