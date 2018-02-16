describe UserEmailsPresenter do
  it 'format emails with names' do
    create(:user, email: '123@asd.rb').tap do |user|
      create :profile, name: 'First User', owner: user
    end

    create(:user, email: '455@asd.rb').tap do |user|
      create :profile, name: 'Second User', owner: user
    end

    result = UserEmailsPresenter.call(User.all)
    expect(result).to include(
      %("First User" <123@asd.rb>), %("Second User" <455@asd.rb>)
    )
  end
end
