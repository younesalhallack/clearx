class Tenant {
  final String id;
  final String name;
  final String email;
  final String defaultCurrency;
  final String timezone;
  final String status;

  Tenant({
    required this.id,
    required this.name,
    required this.email,
    required this.defaultCurrency,
    required this.timezone,
    required this.status,
  });

  factory Tenant.fromJson(Map<String, dynamic> json) => Tenant(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        defaultCurrency: json['defaultCurrency'] ?? '',
        timezone: json['timezone'] ?? '',
        status: json['status'] ?? '',
      );
}
