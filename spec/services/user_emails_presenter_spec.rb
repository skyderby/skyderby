describe UserEmailsPresenter do
  it 'format emails with names' do
    create :user, email: '123@asd.rb', name: 'First User'
    create :user, email: '455@asd.rb', name: 'Second User'

    result = UserEmailsPresenter.call(User.all)
    expect(result).to match(
      [%("First User" <123@asd.rb>), %("Second User" <455@asd.rb>)]
    )
  end
end
