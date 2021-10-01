describe 'next.js' do
  it 'visits, loads, works' do
    visit '/'
    expect(page).to have_text('Next.js')
  end
end
