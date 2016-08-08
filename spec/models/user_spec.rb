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

require 'rails_helper'

RSpec.describe User, type: :model do
  let(:visitor) do
    @visitor ||= {
      name: 'Testy McUserton',
      email: 'example@example.com',
      password: 'changeme',
      password_confirmation: 'changeme'
    }
  end

  context 'creating new user' do
    subject { User.create!(visitor) }

    it 'assigns default role' do
      expect(subject.has_role? :user).to be_truthy
    end

    it 'creates profile' do
      expect(subject.profile).not_to be_nil
    end
  end
end
