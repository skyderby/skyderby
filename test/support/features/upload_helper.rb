module Features
  module UploadHelpers
    def upload(file)
      within '#newTrackModal' do
        fill_in 'name', with: 'Александр К.'
        # fill_in 'Вы летаете в:', with: 'Ghost 3'
        fill_in 'location', with: 'Борки'
        attach_file 'track_file', file
        click_button 'Загрузить'
      end
    end
  end
end
