# db/seeds.rb  (or wherever you run your seed)

user = User.find_or_create_by!(email: "seed@demenaji.com") do |u|
  u.name                  = "Seed User"
  u.password              = "password123"
  u.password_confirmation = "password123"
end

puts "Seed user: #{user.email} (id: #{user.id})"

# ====================== Helper Functions ======================

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

def generate_places(count, city_name, sw_lng, sw_lat, ne_lng, ne_lat, user_id)
  polygon = [
    [sw_lng, sw_lat],
    [sw_lng, ne_lat],
    [ne_lng, ne_lat],
    [ne_lng, sw_lat]
  ]

  places = []
  count.times do
    lng, lat = random_point_in_box(sw_lng, sw_lat, ne_lng, ne_lat, polygon)

    # Random post date over the last ~90 days (mixes new/old across cities)
    post_date = Time.current - rand(0..90).days - rand(0..23).hours

    places << {
      user_id:              user_id,
      rent:                 rand(20_000..200_000),
      bedrooms:             rand(0..6),
      address:              "#{city_name}, Algérie",
      gps_longitude:        lng,
      gps_latitude:         lat,
      description:          "Appartement confortable avec toutes commodités. Proche des transports et commerces.",
      post_date:            post_date,
      number_of_applicants: rand(0..12),
      visitor_count:        rand(10..450),
      deletion_date_time:   Time.at(0)
    }
  end
  places
end

# ====================== Seeding Logic ======================

if Place.count == 0
  puts "Starting seed with mixed cities..."

  total_places = 2000
  places_data = []

  # 50% Algiers, 50% Oran — randomly mixed
  total_places.times do |i|
    if rand < 0.5
      # Algiers
      lng, lat = random_point_in_box(2.87, 36.69, 3.15, 36.83, 
                                     [[2.87,36.69],[2.87,36.83],[3.15,36.83],[3.15,36.69]])
      city_name = "Alger"
    else
      # Oran
      lng, lat = random_point_in_box(-0.75, 35.60, -0.55, 35.78, 
                                     [[-0.75,35.60],[-0.75,35.78],[-0.55,35.78],[-0.55,35.60]])
      city_name = "Oran"
    end

    post_date = Time.current - rand(0..90).days - rand(0..23).hours

    places_data << {
      user_id:              user.id,
      rent:                 rand(20_000..200_000),
      bedrooms:             rand(0..6),
      address:              "#{city_name}, Algérie",
      gps_longitude:        lng,
      gps_latitude:         lat,
      description:          "Appartement confortable avec toutes commodités. Proche des transports et commerces.",
      post_date:            post_date,
      number_of_applicants: rand(0..12),
      visitor_count:        rand(10..450),
      deletion_date_time:   Time.at(0)
    }
  end

  Place.insert_all!(places_data)

  puts "✅ Done! #{Place.count} places created (mixed between Algiers and Oran)."
  puts "   Post dates are randomized over the last 90 days."
else
  puts "Database already seeded (#{Place.count} places exist), skipping."
end