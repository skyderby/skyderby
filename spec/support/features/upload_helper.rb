module Features
  module UploadHelpers
    def upload(file)
      within '#newTrackModal' do
        fill_in 'Вас зовут:', with: 'Александр К.'
        fill_in 'Вы летаете в:', with: 'Ghost 3'
        fill_in 'Локация:', with: 'Борки'
        attach_file 'Файл трека:', file
        click_button 'Загрузить'
      end
    end
  end
end