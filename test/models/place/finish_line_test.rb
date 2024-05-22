describe Place::FinishLine, type: :model do
  it '#center' do
    coordinates = {
      start_latitude: '60.0',
      start_longitude: '10.4',
      end_latitude: '66.0',
      end_longitude: '12.6'
    }
    finish_line = build(:place_finish_line, coordinates)

    expect(finish_line.center[:latitude]).to eq(63)
    expect(finish_line.center[:longitude]).to eq(11.5)
  end
end
