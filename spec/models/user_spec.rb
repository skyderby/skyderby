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

describe User, type: :model do
  describe '#create' do
    it 'assigns default role' do
      expect(user.has_role?(:user)).to be_truthy
    end

    it 'creates profile' do
      expect(user.profile).not_to be_nil
    end

    def user
      @user ||= begin
        Role.find_or_create_by(name: 'user')

        User.create! email: 'example@example.com',
                     password: 'changeme',
                     password_confirmation: 'changeme',
                     profile_attributes: { name: 'Testy McUserton' }
      end
    end
  end

  it '#responsible_of_events' do
    user = create :user
    event = create :event, responsible: user

    expect(user.responsible_of_events).to include event
  end
end
