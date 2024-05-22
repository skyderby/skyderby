describe User::Omniauth do
  it 'finds user by provider and uid' do
    user = User.create! \
      email: 'ab@example.com',
      password: Devise.friendly_token[0, 20],
      provider: :facebook,
      uid: '000-000'

    auth = OmniAuth::AuthHash.new \
      provider: :facebook,
      uid: '000-000',
      info: { email: 'xx@zz.yyy' }

    found_user = User.from_omniauth(auth)

    expect(found_user).to eq(user)
  end

  it 'finds user by email' do
    user = User.create! \
      email: 'ab@example.com',
      password: Devise.friendly_token[0, 20]

    auth = OmniAuth::AuthHash.new \
      provider: :facebook,
      uid: '000-000',
      info: { email: 'ab@example.com' }

    found_user = User.from_omniauth(auth)

    expect(found_user).to eq(user)
  end

  describe 'create new user from auth info' do
    let :auth do
      OmniAuth::AuthHash.new \
        provider: :facebook,
        uid: '000-000',
        info: {
          email: 'ab@example.com',
          image: '',
          first_name: 'Ivan',
          last_name: 'Petrov'
        }
    end

    subject { User.from_omniauth(auth) }

    it 'fill provider' do
      expect(subject.provider).to eq('facebook')
    end

    it 'fill uid' do
      expect(subject.uid).to eq('000-000')
    end

    it 'fill email' do
      expect(subject.email).to eq('ab@example.com')
    end

    it 'fill name' do
      expect(subject.name).to eq('Ivan Petrov')
    end
  end
end
