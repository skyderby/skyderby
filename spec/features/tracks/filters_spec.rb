require 'spec_helper'

feature 'Filtering tracks list', js: true do
  scenario 'Filter by suit' do
    3.times do |x| 
      wingsuit = create :wingsuit, name: "suit-#{x}"
      create :empty_track, wingsuit: wingsuit
    end
    visit tracks_path

    find('#select2-query_wingsuit_id-container').click
    sleep 0.5
    first("li.select2-results__option", text: 'suit-1').click
    sleep 0.5

    expect(page.all('#tracks-table > tbody > tr').count).to eq(1)
    expect(page).to have_css('#tracks-table > tbody > tr > td', text: 'suit-1')
  end
end
