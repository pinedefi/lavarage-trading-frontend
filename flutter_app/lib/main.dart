import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'services/wallet_service.dart';
import 'services/trading_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => WalletService()),
        ChangeNotifierProvider(create: (_) => TradingService()),
      ],
      child: MaterialApp(
        title: 'Leverage Trading App',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF1a1a1a),
          cardColor: const Color(0xFF252525),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
