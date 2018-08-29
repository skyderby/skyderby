describe Event::ReferencePoint do
  describe '.find_or_create' do
    it 'find when only name given' do
      event = events(:published_public)
      created_point = event.reference_points.create!(name: 'R1', latitude: 20, longitude: 20)

      found_point = event.reference_points.find_or_create(name: 'R1')

      expect(found_point).to eq(created_point)
    end

    it 'find when name and coordinates given' do
      event = events(:published_public)
      created_point = event.reference_points.create!(name: 'R1', latitude: 20, longitude: 20)

      found_point = event.reference_points.find_or_create(name: 'R1', latitude: 20, longitude: 20)

      expect(found_point).to eq(created_point)
    end

    it 'create when coordinates different' do
      event = events(:published_public)
      created_point = event.reference_points.create!(name: 'R1', latitude: 20, longitude: 20)

      found_point = event.reference_points.find_or_create(name: 'R1', latitude: 30, longitude: 30)

      expect(found_point.latitude).to eq(30)
      expect(found_point.longitude).to eq(30)
    end
  end
end
