import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/wallet_service.dart';
import '../services/trading_service.dart';
import '../widgets/trading_form.dart';
import '../widgets/position_list.dart';
import '../widgets/wallet_button.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final walletService = context.watch<WalletService>();
    final tradingService = context.watch<TradingService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Leverage Trading'),
        actions: const [
          WalletButton(),
        ],
      ),
      body: SafeArea(
        child: walletService.isConnected
            ? SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Connected Wallet',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              walletService.address,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const TradingForm(),
                    const SizedBox(height: 16),
                    const PositionList(),
                  ],
                ),
              )
            : Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Connect your wallet to start trading',
                      style: TextStyle(fontSize: 18),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => walletService.connectWallet(),
                      child: const Text('Connect Wallet'),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
} 