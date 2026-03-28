user = User.find_or_create_by!(email: "seed@demenaji.com") do |u|
  u.name     = "Seed User"
  u.password = "password123"
  u.password_confirmation = "password123"
end

puts "Seed user: #{user.email} (id: #{user.id})"


def point_in_polygon?(point_lng, point_lat, polygon)
  inside = false
  j = polygon.length - 1
  polygon.each_with_index do |(x_i, y_i), i|
    x_j, y_j = polygon[j]
    if ((y_i > point_lat) != (y_j > point_lat)) &&
       (point_lng < (x_j - x_i) * (point_lat - y_i) / (y_j - y_i) + x_i)
      inside = !inside
    end
    j = i
  end
  inside
end

def random_point_in_box(sw_lng, sw_lat, ne_lng, ne_lat, polygon)
  loop do
    lng = sw_lng + rand * (ne_lng - sw_lng)
    lat = sw_lat + rand * (ne_lat - sw_lat)
    return [lng, lat] if point_in_polygon?(lng, lat, polygon)
  end
end

def generate_places(count, address, sw_lng, sw_lat, ne_lng, ne_lat, user_id)
  polygon = [
    [sw_lng, sw_lat],
    [sw_lng, ne_lat],
    [ne_lng, ne_lat],
    [ne_lng, sw_lat]
  ]

  count.times.map do
    lng, lat = random_point_in_box(sw_lng, sw_lat, ne_lng, ne_lat, polygon)
    {
      user_id:              user_id,
      rent:                 rand(20_000..200_000),
      bedrooms:             rand(0..6),
      address:              address,
      gps_longitude:        lng,
      gps_latitude:         lat,
      description:          "Description " * 29,
      post_date:            Time.utc(2019, 11, 4),
      number_of_applicants: 0,
      visitor_count:        0,
      deletion_date_time:   Time.at(0)
    }
  end
end

if Place.count == 0
  puts "Seeding Algiers (100 places)..."
  algiers = generate_places(100, "Alger, Algérie", 2.87, 36.69, 3.15, 36.83, user.id)

  puts "Seeding Oran (100 places)..."
  oran = generate_places(100, "Oran, Algérie", -0.75, 35.60, -0.55, 35.78, user.id)

  Place.insert_all!(algiers + oran)
  puts "Done! #{Place.count} places created."
else
  puts "Database already seeded, skipping."
end